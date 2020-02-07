import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import React, { useEffect, useContext } from 'react';

import { Login } from './Login';
import { Home } from './Home';
import { Auth } from './Auth';
import { AuthContext } from '../AuthContext';

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

const AuthedRoute = ({children, ...rest}) => {
  const { loggedIn } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={({location}) =>
        loggedIn
          ? (children)
          : (<Redirect to={{ pathname: '/', state: {from: location}}} />)
      }>
    </Route>
  );
};

export const Routes = () => {
  const { loggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (!loggedIn) {
      return;
    }
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
        <Route exact path="/auth" component={Auth}></Route>
        <AuthedRoute exact path="/home"><Home /></AuthedRoute>
        <Route path="/"><Login /></Route>
        <Route path="*"><div>404 error!</div></Route>
      </Switch>
    </Router>
  );
}