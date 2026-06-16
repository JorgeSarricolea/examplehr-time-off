import React from 'react';
import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { StorybookShell } from './StorybookShell';
import { QueryProvider } from '../src/providers/QueryProvider';
import { SnackbarProvider } from '../src/providers/SnackbarProvider';
import { hcmHandlers } from '../src/hcm-mock/msw-handlers';

initialize();

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    msw: { handlers: hcmHandlers },
  },
  decorators: [
    (Story) => (
      <StorybookShell>
        <QueryProvider>
          <SnackbarProvider>
            <Story />
          </SnackbarProvider>
        </QueryProvider>
      </StorybookShell>
    ),
  ],
};

export default preview;
