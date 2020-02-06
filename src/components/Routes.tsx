import { Router, Route, Switch, useHistory } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import React, { useEffect } from 'react';

import { Login } from './Login';
import { Home } from './Home';
import { Auth } from './Auth';

import {
  getOrRefreshOauthToken,
  getRefreshUri,
} from '../utils';

import {
  local,
  AUTH_EXPIRES,
  AUTH_REFRESH_TOKEN,
  AUTH_TOKEN,
} from '../local-storage';

const ls = local();

export const LoggedInRoutes = () => {
  // @ts-ignore
  useEffect(async () => {
    const refreshToken = ls.get(AUTH_REFRESH_TOKEN);
        
    if (!refreshToken) {
      throw new Error('No refresh token. Cannot refresh.');
    }

    const intervalId = setInterval(async () => {
      const expires = ls.get(AUTH_EXPIRES);
      const doesExpireSoon = !!(expires && expires - Date.now()/1000 < 60);

      if (doesExpireSoon) {
        const { uri, payload } = getRefreshUri(
          refreshToken,
          process.env.CLIENT_ID || '',
          process.env.CLIENT_SECRET || '',
        );

        const { access_token, expires_in } = await getOrRefreshOauthToken(uri, payload);
        ls.set(AUTH_EXPIRES, Math.floor(Date.now()/1000) + expires_in);
        ls.set(AUTH_TOKEN, access_token);
        return;
      }

    }, 5000);

    // componentWillUnmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router history={createBrowserHistory()}>
      <Switch>
        <Route exact path="/" component={Home}></Route>
      </Switch>
    </Router>
  );
}

export const NotLoggedInRoutes = () =>
  <Router history={createBrowserHistory()}>
    <Switch>
      <Route exact path="/"><Login isLoggedIn={false} /></Route>
      <Route path="/auth" component={Auth}></Route>
    </Switch>
  </Router>