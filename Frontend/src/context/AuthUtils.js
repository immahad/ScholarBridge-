import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 