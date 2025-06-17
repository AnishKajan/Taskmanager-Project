// src/pages/__tests__/LoginPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock axios first
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Import axios and get the mocked version
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Import useNavigate and get the mocked version
import { useNavigate } from 'react-router-dom';
const mockedUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

// Import component after all mocks
import LoginPage from '../LoginPage';

// Wrapper component that provides router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe('LoginPage Tests', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedAxios.post.mockClear();
    mockNavigate.mockClear();
    mockedUseNavigate.mockReturnValue(mockNavigate);
  });

  test('renders login form elements', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username or Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('renders category display section', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  test('allows user to type in input fields', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    const emailInput = screen.getByPlaceholderText('Username or Email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('calls navigate when Sign Up button is clicked', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  test('makes correct API call on login attempt', async () => {
    const mockResponse = {
      data: {
        token: 'fake-jwt-token',
        username: 'testuser'
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    const emailInput = screen.getByPlaceholderText('Username or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/auth/login',
        {
          email: 'test@example.com',
          password: 'password123'
        }
      );
    });
  });

  test('stores data in localStorage on successful login', async () => {
    const mockResponse = {
      data: {
        token: 'fake-jwt-token',
        username: 'testuser'
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    const emailInput = screen.getByPlaceholderText('Username or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-jwt-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('email', 'testuser');
    });
  });

  test('navigates to dashboard on successful login', async () => {
    const mockResponse = {
      data: {
        token: 'fake-jwt-token',
        username: 'testuser'
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    const emailInput = screen.getByPlaceholderText('Username or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('shows error message on failed login', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Incorrect Password'
        }
      }
    };
    
    mockedAxios.post.mockRejectedValueOnce(mockError);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    const emailInput = screen.getByPlaceholderText('Username or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Incorrect Password')).toBeInTheDocument();
    });
  });

  test('shows error when no token received', async () => {
    const mockResponse = {
      data: {
        username: 'testuser'
        // No token
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    const emailInput = screen.getByPlaceholderText('Username or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed: No token received')).toBeInTheDocument();
    });
  });

  test('shows success message on successful login', async () => {
    const mockResponse = {
      data: {
        token: 'fake-jwt-token',
        username: 'testuser'
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );
    
    const emailInput = screen.getByPlaceholderText('Username or Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Login successful')).toBeInTheDocument();
    });
  });
});