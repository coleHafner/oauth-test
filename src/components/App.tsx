import React, { useState } from 'react';
import { Routes } from './Routes';
import { AuthContext } from '../AuthContext';
import { local as ls, AUTH_TOKEN, AUTH_EXPIRES } from '../local-storage';

export const App = () => {

  const [loggedIn, setLoggedIn] = useState(!!(
    ls.get(AUTH_TOKEN) &&
    ls.get(AUTH_EXPIRES)
  ));

  const login = (cb: () => void) => {
    setLoggedIn(true);
    cb();
  }

  const logout = () => {
    setLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ 
      loggedIn, 
      actions: {
        logout, 
        login 
      }
    }}>
      <Routes />
    </AuthContext.Provider>
  );
};
