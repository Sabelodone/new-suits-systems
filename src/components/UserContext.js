// UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signIn = async (email, password) => {
    // Perform sign-in logic, then set the user state
    setUser({ email }); // Example: set user state after successful login
  };

  const signOut = () => {
    setUser(null); // Clear user state on logout
  };

  return (
    <UserContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
