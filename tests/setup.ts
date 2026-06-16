import '@testing-library/jest-dom/vitest';
import { resetHcmState } from '@/hcm-mock/store';
import { beforeEach } from 'vitest';

beforeEach(() => {
  resetHcmState();
});
