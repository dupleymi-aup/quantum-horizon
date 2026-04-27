import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IsoclinesVisualization } from './isoclines';

const meta: Meta<typeof IsoclinesVisualization> = {
  title: 'Cosmos/IsoclinesVisualization',
  component: IsoclinesVisualization,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const IsoclinesMode: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Режим изоклин: dy/dx = x² + y². Окружности являются линиями равного наклона.',
      },
    },
  },
};

export const TrajectoriesMode: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Режим траекторий: dy/dx = -x/y. Концентрические орбиты частиц.',
      },
    },
  },
};
