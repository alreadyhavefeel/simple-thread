"use client"
import React  from 'react'
import { createContext ,useState } from 'react';

// Create the UserContext
export const UserContext = createContext({
  user: { id: '', username: '' },
  //setUser: () => {}
  setUser: () => {} // Default value for setUser as a no-op function
});

// Create the UserProvider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: '',
    username: ''
  });
  //console.log("UserProvider rendered", user);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      { children }
    </UserContext.Provider>
  );
};