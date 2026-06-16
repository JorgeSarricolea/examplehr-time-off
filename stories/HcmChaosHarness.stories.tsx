import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ChaosPanel } from '@/shared/ui/HomePage';
import { QueryProvider } from '@/providers/QueryProvider';

const meta: Meta = {
  title: 'Dev/HcmChaosHarness',
  decorators: [
    (Story) => (
      <QueryProvider>
        <Story />
      </QueryProvider>
    ),
  ],
};
export default meta;

export const Controls: StoryObj = {
  name: 'HCM chaos harness — trigger edge cases',
  render: () => <ChaosPanel />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('HCM Simulator (dev)')).toBeInTheDocument();
    const btn = canvas.getByRole('button', { name: 'Anniversary bonus' });
    await userEvent.click(btn);
  },
};
