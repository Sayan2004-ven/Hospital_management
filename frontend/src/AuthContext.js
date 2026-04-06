import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// ✅ FIX 6 & 7: Central auth state so Login and AdminLogin
//    persist session across pages, and guards can check it.
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);  // logged-in customer
  const [isAdmin, setIsAdmin] = useState(false); // admin flag

  const loginUser  = (userData) => setUser(userData);
  const loginAdmin = ()         => setIsAdmin(true);
  const logout     = ()         => { setUser(null); setIsAdmin(false); };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}