import React, { useState } from 'react';
import { LoggedInRoutes, NotLoggedInRoutes } from './Routes';
import { AuthContext } from '../AuthContext';
import { local as ls, AUTH_TOKEN, AUTH_EXPIRES } from '../local-storage';

export const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!(
    ls.get(AUTH_TOKEN) &&
    ls.get(AUTH_EXPIRES)
  ));

  const login = (cb: () => void) => {
    setIsLoggedIn(true);
    cb();
  }

  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ loggedIn: false, logout, login }}>
      {isLoggedIn
        ? <LoggedInRoutes />
        : <NotLoggedInRoutes />
      }
    </AuthContext.Provider>
  );
};
