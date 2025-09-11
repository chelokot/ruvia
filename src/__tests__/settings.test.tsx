import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Settings from '@/screens/Settings';

const mockLogout = jest.fn().mockResolvedValue(undefined);
const mockReplace = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ logout: mockLogout, user: { displayName: 'Test', email: 'test@example.com' } })
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() })
}));

describe('Settings logout', () => {
  it('redirects to sign up page on logout', async () => {
    const { getByText } = render(<Settings />);
    await act(async () => {
      fireEvent.press(getByText('Log out'));
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(mockLogout).toHaveBeenCalled();
  });
});
