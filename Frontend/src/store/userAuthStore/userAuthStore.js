import { create } from 'zustand';

const initialRole = localStorage.getItem("role") || null;

const useUserAuthStore = create((set) => ({
  roleValue: initialRole,
  setRolevalue: (roleValue) => {
    set({ roleValue });
    localStorage.setItem("role", roleValue);
  },
  logout: () => {
    set({ roleValue: null });
    localStorage.removeItem("userEmail");
    localStorage.removeItem("confirmationDetails");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("role");
    window.location.reload();
  },
  isLoggedIn: () => {
    return useUserAuthStore.getState().roleValue !== null;
  }
}));

export default useUserAuthStore;
