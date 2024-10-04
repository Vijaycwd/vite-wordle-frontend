import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a Context for the auth data
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    const userAuthData = JSON.parse(localStorage.getItem('auth'));
    setAuthData(userAuthData);
  }, []);

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access
export const useAuth = () => {
  return useContext(AuthContext);
};
