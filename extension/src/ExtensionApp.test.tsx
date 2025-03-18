import React from 'react';
import { render, screen } from '@testing-library/react';
import ExtensionApp from './ExtensionApp';

test('renders learn react link', () => {
  render(<ExtensionApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
