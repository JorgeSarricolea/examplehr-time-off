export interface LocationMeta {
  title: string;
  subtitle: string;
}

export const LOCATION_META: Record<string, LocationMeta> = {
  'loc-austin': {
    title: 'Austin HQ',
    subtitle: 'On-site',
  },
  'loc-remote': {
    title: 'Remote',
    subtitle: 'Work from home',
  },
  'loc-nyc': {
    title: 'New York',
    subtitle: 'Regional office',
  },
};

export function getLocationMeta(locationId: string, fallbackName?: string): LocationMeta {
  return (
    LOCATION_META[locationId] ?? {
      title: fallbackName ?? locationId,
      subtitle: 'Work location',
    }
  );
}

export function formatLocationLine(locationId: string, fallbackName?: string): string {
  const { title, subtitle } = getLocationMeta(locationId, fallbackName);
  return `${title} · ${subtitle}`;
}
