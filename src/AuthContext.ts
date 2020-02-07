import React, { createContext } from 'react';

export const AuthContext = createContext({
  loggedIn: false,
  actions: {
    login: (cb: () => void) => {},
    logout: () => {}
  }
});