let mockPathname = '/employee/requests';

export function setMockPathname(path: string) {
  mockPathname = path;
}

export function resetMockPathname() {
  mockPathname = '/employee/requests';
}

export function useRouter() {
  return {
    push: () => undefined,
    replace: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
    prefetch: async () => undefined,
  };
}

export function usePathname() {
  return mockPathname;
}

export function useSearchParams() {
  return new URLSearchParams();
}
