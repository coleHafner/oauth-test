import React, { createContext } from 'react';

export const AuthContext = createContext({
  loggedIn: false,
  login: (cb: () => void) => {},
  logout: () => {}
});