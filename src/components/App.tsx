import React, { useState, useEffect } from 'react';
import { LoggedInRoutes, NotLoggedInRoutes } from './Routes';

import {
  local,
  AUTH_EXPIRES,
  AUTH_TOKEN,
} from '../local-storage';

export const App = () => {
  const ls = local();
  const [expires, setExpires] = useState(ls.get(AUTH_EXPIRES));
  const [authToken, setAuthToken] = useState(ls.get(AUTH_TOKEN));
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(expires && authToken);
  }, [authToken, expires]);

  return (
    isLoggedIn
      ? <LoggedInRoutes />
      : <NotLoggedInRoutes />
  );
};
