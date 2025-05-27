import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import Button from './src/components/Button'; // now it works

Object.assign(navigator, {
    clipboard: {
      writeText: () => {},
      readText: () => Promise.resolve(''),
    },
  });

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  userEvent.click(screen.getByText(/click me/i));
  expect(handleClick).toHaveBeenCalled();
});
