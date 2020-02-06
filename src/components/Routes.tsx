import { Router, Route, Switch } from 'react-router-dom';
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
  local as ls,
  AUTH_EXPIRES,
  AUTH_REFRESH_TOKEN,
  AUTH_TOKEN,
} from '../local-storage';

export const LoggedInRoutes = () => {
  useEffect(() => {
    let intervalId: any;

    (async () => {
      const refreshToken = ls.get(AUTH_REFRESH_TOKEN);
          
      if (!refreshToken) {
        console.log('No refresh token. Cannot refresh.');
        return;
      }

      intervalId = setInterval(async () => {
        const expires: string = ls.get(AUTH_EXPIRES) || '0';
        const doesExpireSoon = !!(expires && parseInt(expires) - Date.now()/1000 < 60);

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
    })();

    // componentWillUnmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router history={createBrowserHistory()}>
      <Switch>
        <Route path="/" component={Home}></Route>
        <Route path="*">
          <div>404 error!</div>
        </Route>
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