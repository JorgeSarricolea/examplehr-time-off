import React, { useEffect } from 'react';
import type { Decorator } from '@storybook/react';
import { resetMockPathname, setMockPathname } from './mocks/next-navigation';
import { useSessionStore } from '../src/features/auth/session-store';
import { resetHcmState } from '../src/hcm-mock/store';
import type { SessionUser } from '../src/shared/types/hcm';

export const ALEX_SESSION: SessionUser = {
  userId: 'emp-alex',
  email: 'alex@example.com',
  name: 'Alex Rivera',
  role: 'employee',
};

export const MORGAN_SESSION: SessionUser = {
  userId: 'mgr-morgan',
  email: 'morgan@example.com',
  name: 'Morgan Lee',
  role: 'manager',
};

export function withSession(user: SessionUser, pathname?: string): Decorator {
  return (Story) => {
    function SessionWrapper() {
      useEffect(() => {
        resetHcmState();
        if (pathname) setMockPathname(pathname);
        useSessionStore.setState({
          user,
          selectedRequestId: null,
          optimisticDeductions: [],
        });
        return () => {
          resetMockPathname();
          useSessionStore.setState({
            user: null,
            selectedRequestId: null,
            optimisticDeductions: [],
          });
        };
      }, []);

      return <Story />;
    }

    return <SessionWrapper />;
  };
}

export const resetMockDecorator: Decorator = (Story) => {
  resetHcmState();
  return <Story />;
};
