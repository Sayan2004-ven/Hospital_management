import { render, screen } from '@testing-library/react';
import App from './App';

// ✅ FIX 9: Test what the Home page actually renders, not the CRA default text
test('renders the Nexus home page', () => {
  render(<App />);
  // The Home page shows "Welcome Back" and both action buttons
  expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
});