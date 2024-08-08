// UserContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userAuthData, setUserAuthData] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('auth'));
    setUserAuthData(data);
  }, []);

  return (
    <UserContext.Provider value={userAuthData}>
      {children}
    </UserContext.Provider>
  );
};
