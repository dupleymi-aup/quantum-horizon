import React from 'react';
import { render, screen } from '@testing-library/react';
import { IsoclinesVisualization } from './isoclines';

describe('IsoclinesVisualization', () => {
  it('renders the component header', () => {
    render(<IsoclinesVisualization />);
    expect(screen.getByText(/Кольца Сатурна: Метод Изоклин/i)).toBeInTheDocument();
  });

  it('renders mode selector buttons', () => {
    render(<IsoclinesVisualization />);
    expect(screen.getByText('Изоклины')).toBeInTheDocument();
    expect(screen.getByText('Траектории')).toBeInTheDocument();
  });

  it('renders educational content about isoclines', () => {
    render(<IsoclinesVisualization />);
    expect(screen.getByText(/Что такое изоклины\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Изоклина/i)).toBeInTheDocument();
  });

  it('renders Saturn rings list', () => {
    render(<IsoclinesVisualization />);
    expect(screen.getByText('Кольцо D')).toBeInTheDocument();
    expect(screen.getByText('Кольцо C')).toBeInTheDocument();
    expect(screen.getByText('Кольцо B')).toBeInTheDocument();
    expect(screen.getByText('Деление Кассини')).toBeInTheDocument();
    expect(screen.getByText('Кольцо A')).toBeInTheDocument();
    expect(screen.getByText('Кольцо F')).toBeInTheDocument();
  });

  it('renders control buttons', () => {
    render(<IsoclinesVisualization />);
    expect(screen.getByLabelText(/Частицы/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Поле направлений/i)).toBeInTheDocument();
  });
});
