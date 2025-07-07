import React, { createContext, useContext, useState } from 'react';

const PostgresAuthContext = createContext();

export const usePostgresAuth = () => {
  const context = useContext(PostgresAuthContext);
  if (!context) {
    throw new Error('usePostgresAuth must be used within a PostgresAuthProvider');
  }
  return context;
};

export const PostgresAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <PostgresAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </PostgresAuthContext.Provider>
  );
};
