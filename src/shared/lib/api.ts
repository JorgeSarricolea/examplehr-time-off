const API_BASE = '/api/hcm';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.message ?? 'Request failed'), {
      status: res.status,
      code: data.code,
      data,
    });
  }
  return data as T;
}

export const hcmApi = {
  getBalancesBatch: (employeeId: string) =>
    fetchJson<{ items: import('@/shared/types/hcm').BalanceCell[]; fetchedAt: string }>(
      `${API_BASE}/balances/batch?employeeId=${employeeId}`,
    ),

  getBalanceCell: (
    employeeId: string,
    locationId: string,
    balanceType: string,
  ) =>
    fetchJson<import('@/shared/types/hcm').BalanceCell>(
      `${API_BASE}/balances/${employeeId}/${locationId}?balanceType=${balanceType}`,
    ),

  listRequests: (filters: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchJson<{ items: import('@/shared/types/hcm').TimeOffRequest[] }>(
      `${API_BASE}/time-off-requests?${params}`,
    );
  },

  createRequest: (body: import('@/shared/types/hcm').CreateTimeOffRequest) =>
    fetchJson<import('@/shared/types/hcm').TimeOffRequest>(`${API_BASE}/time-off-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  patchRequest: (
    requestId: string,
    body: import('@/shared/types/hcm').PatchTimeOffRequest,
  ) =>
    fetchJson<import('@/shared/types/hcm').TimeOffRequest>(
      `${API_BASE}/time-off-requests/${requestId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    ),

  withdrawRequest: async (requestId: string) => {
    const res = await fetch(`${API_BASE}/time-off-requests/${requestId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw Object.assign(new Error(data.message ?? 'Withdraw failed'), {
        status: res.status,
        code: data.code,
      });
    }
  },

  triggerChaos: (body: import('@/shared/types/hcm').ChaosTrigger) =>
    fetchJson<import('@/shared/types/hcm').ChaosResult>(`${API_BASE}/dev/chaos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};

export const authApi = {
  login: (email: string) =>
    fetchJson<import('@/shared/types/hcm').SessionUser>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
  logout: () => fetch('/api/auth/login', { method: 'DELETE' }),
};
