'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Grid2 as Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useCreateRequestMutation } from '@/features/balances/hooks';
import type { BalanceCell, BalanceType } from '@/shared/types/hcm';
import { BALANCE_TYPE_LABELS } from '@/shared/lib/balance-labels';
import { createTimeOffRequestSchema } from '@/shared/lib/schemas';
import { getLocationMeta } from '@/shared/lib/locations';
import { useSnackbar } from '@/providers/SnackbarProvider';
import {
  clampEndDate,
  clampStartDate,
  countBusinessDays,
  maxEndDateForStart,
  minStartDateForEnd,
  nextOrSameBusinessDayIso,
  todayIso,
} from '@/shared/lib/date-utils';

function toDayjs(iso: string): Dayjs | null {
  return iso ? dayjs(iso) : null;
}

function isWeekendDay(date: Dayjs): boolean {
  const day = date.day();
  return day === 0 || day === 6;
}

interface RequestFormProps {
  employeeId: string;
  balances: BalanceCell[];
  initialError?: string | null;
  initialStartDate?: string;
  initialEndDate?: string;
  onSuccess?: (requestId: string) => void;
  onConflict?: (message: string, daysRequested: number) => void;
}

export function RequestForm({
  employeeId,
  balances,
  initialError = null,
  initialStartDate = '',
  initialEndDate = '',
  onSuccess,
  onConflict,
}: RequestFormProps) {
  const mutation = useCreateRequestMutation(employeeId);
  const { notify } = useSnackbar();
  const availableTypes = useMemo(() => {
    const types = new Set<BalanceType>();
    balances.forEach((b) => types.add(b.balanceType));
    return Array.from(types);
  }, [balances]);

  const [balanceType, setBalanceType] = useState<BalanceType>('vacation');
  const [locationId, setLocationId] = useState('');
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(initialError);

  const typeBalances = useMemo(
    () => balances.filter((b) => b.balanceType === balanceType),
    [balances, balanceType],
  );

  const typeBalancesWithDays = useMemo(
    () => typeBalances.filter((b) => b.availableDays >= 1),
    [typeBalances],
  );

  useEffect(() => {
    if (availableTypes.length > 0 && !availableTypes.includes(balanceType)) {
      setBalanceType(availableTypes[0]);
    }
  }, [availableTypes, balanceType]);

  useEffect(() => {
    const isValid = locationId && typeBalances.some((b) => b.locationId === locationId);
    if (isValid) return;
    const defaultLocation =
      typeBalances.find((b) => b.availableDays >= 1)?.locationId ?? typeBalances[0]?.locationId;
    if (defaultLocation) setLocationId(defaultLocation);
  }, [locationId, typeBalances]);

  const today = todayIso();
  const earliestStart = nextOrSameBusinessDayIso(today);
  const selectedBalance = typeBalances.find((b) => b.locationId === locationId);
  const availableDays = selectedBalance?.availableDays ?? 0;
  const hasBalance = availableDays >= 1;
  const balanceLabel = BALANCE_TYPE_LABELS[balanceType];

  const endMax = startDate && hasBalance ? maxEndDateForStart(startDate, availableDays) : undefined;
  const startMin =
    endDate && hasBalance
      ? (minStartDateForEnd(endDate, availableDays) > earliestStart
          ? minStartDateForEnd(endDate, availableDays)
          : earliestStart)
      : earliestStart;
  const startMax = endDate || undefined;

  const daysRequested = useMemo(
    () => countBusinessDays(startDate, endDate),
    [startDate, endDate],
  );

  const handleBalanceTypeChange = (nextType: BalanceType) => {
    setBalanceType(nextType);
    setStartDate('');
    setEndDate('');
    setLocationId('');
  };

  const handleLocationChange = (newLocationId: string) => {
    setLocationId(newLocationId);
    const newAvail =
      typeBalances.find((b) => b.locationId === newLocationId)?.availableDays ?? 0;
    if (!startDate) return;
    let nextEnd = endDate;
    if (nextEnd) {
      nextEnd = clampEndDate(startDate, nextEnd, newAvail);
      setEndDate(nextEnd);
    }
    setStartDate((prev) =>
      nextEnd ? clampStartDate(prev, nextEnd, newAvail, earliestStart) : prev,
    );
  };

  const handleStartChange = (value: string) => {
    if (!value) {
      setStartDate('');
      setEndDate('');
      return;
    }
    const nextStart =
      endDate && hasBalance
        ? clampStartDate(value, endDate, availableDays, earliestStart)
        : value < earliestStart
          ? earliestStart
          : value;
    setStartDate(nextStart);
    if (endDate && hasBalance) {
      setEndDate(clampEndDate(nextStart, endDate, availableDays));
    }
  };

  const handleEndChange = (value: string) => {
    if (!value) {
      setEndDate('');
      return;
    }
    if (!startDate) {
      setEndDate(value);
      return;
    }
    setEndDate(hasBalance ? clampEndDate(startDate, value, availableDays) : value);
  };

  const canSubmit =
    hasBalance &&
    Boolean(startDate && endDate) &&
    daysRequested !== null &&
    daysRequested >= 1 &&
    daysRequested <= availableDays &&
    !mutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit || daysRequested === null) return;

    const payload = {
      employeeId,
      locationId,
      balanceType,
      startDate,
      endDate,
      daysRequested,
      note: note || undefined,
    };

    const parsed = createTimeOffRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid form');
      return;
    }

    try {
      notify('Sending request — confirming with payroll…', { severity: 'info' });
      const result = await mutation.mutateAsync(parsed.data);
      if (result.status === 'silently_wrong') {
        notify('Payroll responded, but we need you to verify the details.', {
          severity: 'warning',
        });
        onConflict?.(
          'Payroll returned success but the numbers may not match. Please verify.',
          daysRequested,
        );
      } else {
        notify('Request sent. Waiting for manager approval.', { severity: 'success' });
        onSuccess?.(result.id);
      }
      setStartDate('');
      setEndDate('');
      setNote('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submit failed';
      setError(message);
      notify(message, { severity: 'error' });
    }
  };

  const rangeHint =
    startDate && endMax
      ? `End date limited to ${endMax} (${availableDays} business days max from start)`
      : endDate && hasBalance
        ? `Start date limited so your range stays within ${availableDays} business days`
        : `Up to ${availableDays} business day(s) at this location`;

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {typeBalances.length === 0 ? (
        <Typography color="text.secondary">No {balanceLabel.toLowerCase()} balances available.</Typography>
      ) : typeBalancesWithDays.length === 0 ? (
        <Alert severity="warning">
          No {balanceLabel.toLowerCase()} days left at any location. Try the other balance type or
          contact HR.
        </Alert>
      ) : (
        <>
          {availableTypes.length > 1 && (
            <TextField
              select
              label="Time off type"
              value={balanceType}
              onChange={(e) => handleBalanceTypeChange(e.target.value as BalanceType)}
              fullWidth
            >
              {availableTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {BALANCE_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </TextField>
          )}

          {!hasBalance ? (
            <Alert severity="warning">No days available at this location.</Alert>
          ) : (
            <>
              <TextField
                select
                label="Work location"
                value={locationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                fullWidth
                helperText={`${balanceLabel} is deducted from the balance at this location`}
              >
                {typeBalances.map((b) => {
                  const loc = getLocationMeta(b.locationId, b.locationName);
                  return (
                    <MenuItem key={b.locationId} value={b.locationId}>
                      <Stack>
                        <Typography variant="body2">
                          {loc.title} — {b.availableDays} days
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {loc.subtitle}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </TextField>

              <Typography variant="caption" color="text.secondary">
                {rangeHint}
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Start date"
                    value={toDayjs(startDate)}
                    onChange={(value) =>
                      handleStartChange(value ? value.format('YYYY-MM-DD') : '')
                    }
                    minDate={dayjs(startMin)}
                    maxDate={startMax ? dayjs(startMax) : undefined}
                    shouldDisableDate={isWeekendDay}
                    disabled={!hasBalance}
                    slotProps={{
                      textField: { fullWidth: true, required: true },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="End date"
                    value={toDayjs(endDate)}
                    onChange={(value) => handleEndChange(value ? value.format('YYYY-MM-DD') : '')}
                    minDate={dayjs(startDate || earliestStart)}
                    maxDate={endMax ? dayjs(endMax) : undefined}
                    shouldDisableDate={isWeekendDay}
                    disabled={!hasBalance || !startDate}
                    slotProps={{
                      textField: { fullWidth: true, required: true },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Days requested"
                    value={daysRequested ?? ''}
                    fullWidth
                    required
                    slotProps={{ input: { readOnly: true } }}
                    helperText={
                      startDate && endDate && daysRequested !== null
                        ? daysRequested === 0
                          ? 'No business days in range'
                          : `${daysRequested} of ${availableDays}`
                        : undefined
                    }
                    error={daysRequested === 0}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button type="submit" variant="contained" size="large" disabled={!canSubmit}>
                {mutation.isPending ? 'Confirming…' : 'Submit request'}
              </Button>
            </>
          )}
        </>
      )}
    </Stack>
  );
}
