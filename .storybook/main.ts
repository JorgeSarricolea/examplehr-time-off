import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'msw-storybook-addon',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          'next/navigation': path.resolve(__dirname, './mocks/next-navigation.ts'),
        },
      },
      esbuild: {
        jsx: 'automatic',
      },
      optimizeDeps: {
        esbuildOptions: {
          jsx: 'automatic',
        },
      },
    }),
};

export default config;
