import React, { useState } from 'react';
import { createBrowserHistory } from 'history';
import { Router, Route, Switch, useHistory } from 'react-router-dom';
import { getVerificationUri, getVerifier, extractUriParams, getAuthorizationUri } from '../utils';
import axios from 'axios'

const AUTH_VERIFIER = 'auth-verifier';
const AUTH_STATE = 'auth-state';
const AUTH_CHALLENGE = 'auth-challenge';
const AUTH_CODE = 'auth-code';
const AUTH_REFRESH_TOKEN = 'auth-refresh-token';
const AUTH_TOKEN = 'auth-refresh-token';
const AUTH_EXPIRES = 'auth-expires-utc';
const AUTH_ID_TOKEN = 'auth-id-token';

const local = (): any => {
  const STORAGE_KEY = 'oauth-test';

  const getSession = (): {[key: string]: string} => 
    JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");

  const setSession = (session: {[key: string]: string} = {}): void => 
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  const session = getSession();

  return {
    clear: () => setSession(),
    get: (key: string): string|undefined => session[key],
    set: (key: string, val: string): any => {
      session[key] = val;
      setSession(session);
      return session;
    }
  }
}

const ls = local();

const startOauth = (): string => {
  const clientId = process.env.CLIENT_ID;

  if (!clientId) {
    throw new Error('Client ID required! Set it in your .env file...');
  }

  const { code_verifier, code_challenge } = getVerifier();
  const state = `${Math.random() * 1117878}`;

  // @TODO store verifier in localStorage
  ls.set(AUTH_VERIFIER, code_verifier);
  ls.set(AUTH_CHALLENGE, code_challenge);
  ls.set(AUTH_STATE, state);

  return getVerificationUri(
    clientId,
    'https://localhost/auth',
    code_challenge,
    state,
  );
};

const isLoggedIn = (): boolean => !!(
  ls.get(AUTH_CODE) &&
  ls.get(AUTH_TOKEN) &&
  ls.get(AUTH_ID_TOKEN)
);

const Login = () => 
  <a href={startOauth()}>
    Login with Google
  </a>

const Home = function() {
  const history = useHistory();

  const doLogout = function(e: React.SyntheticEvent) {
    e.preventDefault();
    ls.clear();
    history.go(0);
  }

  return (
    <>
      <h1>Welcome, you are logged in!</h1>
      <a href="#" onClick={doLogout}>
        Logout
      </a>
    </>
  )
}

const Auth = () => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const history = useHistory();

  if (!clientId || !clientSecret) {
    throw new Error('ClientId or clientSecret not found. Cannot continue.')
  }

  const expectedState = ls.get(AUTH_STATE);
  const {code, state} = extractUriParams(window.location.href);

  if (state !== expectedState) {
    throw new Error(`State "${state}" !== "${expectedState}". Cannot continue.`);
  }
  console.log('clientID', clientId);
  console.log('clientSecret', clientSecret);

  const [error, setError] = useState('');
  const [didSend, setDidSend] = useState(false);
  ls.set(AUTH_CODE, decodeURIComponent(code));

  if (!didSend) {
    setDidSend(true);

    const {uri, payload } = getAuthorizationUri(
      ls.get(AUTH_CODE),
      ls.get(AUTH_VERIFIER),
      clientId,
      clientSecret,
      'https://localhost/auth',
    );

    // post to get token
    axios.post(
      uri,
      payload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
      .then(res => {
        console.log('RES', res.data);
        const {
          access_token, 
          refresh_token, 
          expires_in,
          id_token,
        } = res.data;

        ls.set(AUTH_TOKEN, access_token);
        ls.set(AUTH_EXPIRES, Date.now() + expires_in);
        ls.set(AUTH_ID_TOKEN, id_token);
        ls.set(AUTH_REFRESH_TOKEN, refresh_token);
        history.push('/');
        history.go(0);
      })
      .catch(err => {
        console.log(err);
        setError('Error logging in!');
      });
  }

  return !error
    ? <div>loading...</div>
    : <h3 style={{color: 'red'}}>{error}</h3> 
}

const LoggedInRoutes = () =>
  <Router history={createBrowserHistory()}>
    <Switch>
      <Route exact path="/" component={Home}></Route>
    </Switch>
  </Router>

const NotLoggedInRoutes = () =>
  <Router history={createBrowserHistory()}>
    <Switch>
      <Route exact path="/" component={Login}></Route>
      <Route path="/auth" component={Auth}></Route>
    </Switch>
  </Router>

export const App = () =>
  isLoggedIn()
    ? <LoggedInRoutes />
    : <NotLoggedInRoutes />
