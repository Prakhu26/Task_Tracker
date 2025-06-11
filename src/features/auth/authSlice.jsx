import { createSlice } from "@reduxjs/toolkit";

const loadUser = () => {
  const userData = localStorage.getItem("currentUser") || localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

const initialState = {
  user: loadUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      // Store in localStorage for persistence
      localStorage.setItem("currentUser", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      // Remove from localStorage
      localStorage.removeItem("currentUser");
      localStorage.removeItem("user");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;