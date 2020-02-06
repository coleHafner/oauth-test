import React, { useState, useEffect } from 'react';
import { createBrowserHistory } from 'history';
import { Router, Route, Switch, useHistory } from 'react-router-dom';

import { 
  getVerificationUri, 
  getVerifier, 
  extractUriParams, 
  getAuthorizationUri, 
  getOrRefreshOauthToken,
  getRefreshUri,
  sendProfileRequest,
} from '../utils';

import {
  local,
  AUTH_CHALLENGE,
  AUTH_CODE,
  AUTH_EXPIRES,
  AUTH_ID_TOKEN,
  AUTH_REFRESH_TOKEN,
  AUTH_STATE,
  AUTH_TOKEN,
  AUTH_VERIFIER,
  PROFILE_EMAIL,
  PROFILE_NAME,
  PROFILE_PIC,
} from '../local-storage';

const ls = local();

const isLoggedIn = (): boolean => !!(
  ls.get(AUTH_EXPIRES) &&
  ls.get(AUTH_TOKEN)
);

const Login = () => {
  if (isLoggedIn()) {
    return <div>Redirecting...</div>;
  }

  const [uri, setUri] = useState('');

  useEffect(() => {
    const { code_verifier, code_challenge } = getVerifier();
    const state = `${Math.random() * 1117878}`;

    // @TODO store verifier in localStorage
    ls.set(AUTH_VERIFIER, code_verifier);
    ls.set(AUTH_CHALLENGE, code_challenge);
    ls.set(AUTH_STATE, state);

    setUri(
      getVerificationUri(
        process.env.CLIENT_ID || '',
        'https://localhost/auth',
        code_challenge,
        state,
      )
    );
  }, []);

  return (
    <a href={uri} style={{
      display: 'block',
      textDecoration: 'none',
      padding: '50px',
      border: '1px solid #ccc',
      borderRadius: '7px',
      width: '200px',
      textAlign: 'center',
      fontSize: '20px',
      fontFamily: 'arial',
      fontWeight: 'bold',
      position: 'absolute',
      right: '50%',
      top: '50%',
      marginRight: '-150px',
      marginTop: '-100px',
      backgroundColor: 'mediumseagreen',
      color: 'white',
      boxShadow: '0 0 20px rgba(1, 1, 1, .33)',
    }}>
      Login with Google
    </a>
  );
}

const Home = function() {
  const history = useHistory();
  const [email, setEmail] = useState(ls.get(PROFILE_EMAIL));
  const [name, setName] = useState(ls.get(PROFILE_NAME));
  const [pic, setPic] = useState(ls.get(PROFILE_PIC));

  // @ts-ignore
  useEffect(async () => {
    if (!name || !pic || !email) {
      // make some kind of Google API call 
      const res = await sendProfileRequest(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        ls.get(AUTH_TOKEN),
      );

      setName(res.given_name);
      setEmail(res.email);
      setPic(res.picture);

      ls.set(PROFILE_NAME, res.given_name);
      ls.set(PROFILE_EMAIL, res.email);
      ls.set(PROFILE_PIC, res.picture);
    }
  }, []);

  const doLogout = function(e: React.SyntheticEvent) {
    e.preventDefault();
    ls.clear();
    history.go(0);
  }

  return (
    <>
      {pic && name && email && 
        <div>
          <img src={pic} />
          {name} - {email}
        </div>
      }
      <h1>Welcome, you are logged in!</h1>
      <a href="#" onClick={doLogout}>
        Logout
      </a>
    </>
  )
}

const Auth = () => {
  const history = useHistory();
  const [error, setError] = useState('');
  const [didSend, setDidSend] = useState(false);
  
  // @ts-ignore
  useEffect(async () => {
    const expectedState = ls.get(AUTH_STATE);
    const {code, state} = extractUriParams(window.location.href);
    
    if (state !== expectedState) {
      throw new Error(`State "${state}" !== "${expectedState}". Cannot continue.`);
    }
    
    ls.set(AUTH_CODE, decodeURIComponent(code));

    const {uri, payload } = getAuthorizationUri(
      ls.get(AUTH_CODE),
      ls.get(AUTH_VERIFIER),
      process.env.CLIENT_ID || '',
      process.env.CLIENT_SECRET || '',
      'https://localhost/auth',
    );

    try {
      const { 
        access_token, 
        refresh_token, 
        expires_in, 
        id_token,
      } = await getOrRefreshOauthToken(uri, payload);
        
      ls.setAll({
        [AUTH_EXPIRES]: Math.floor(Date.now()/1000) + expires_in,
        [AUTH_REFRESH_TOKEN]: refresh_token,
        [AUTH_TOKEN]: access_token,
        [AUTH_ID_TOKEN]: id_token,
        [AUTH_CHALLENGE]: '',
        [AUTH_VERIFIER]: '',
        [AUTH_STATE]: '',
        [AUTH_CODE]: '',
      });

      setDidSend(true);

    } catch (err) {
      console.log(`ERROR: ${err}`)
      setError('Error signing in!');
    }
  }, []);

  // history cannot be used inside async func
  useEffect(() => {
    if (!didSend) return;
    history.push('/');
    history.go(0);
  }, [didSend])

  return !error
    ? <div>loading...</div>
    : <h3 style={{color: 'red'}}>{error}</h3> 
}

const LoggedInRoutes = () => {
  // @ts-ignore
  useEffect(async () => {
    setInterval(async () => {
      const expires = ls.get(AUTH_EXPIRES);
      const doesExpireSoon = !!(expires && expires - Date.now()/1000 < 60);

      if (doesExpireSoon) {
        const refreshToken = ls.get(AUTH_REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error('No refresh token. Cannot refresh.');
        }

        const {uri, payload } = getRefreshUri(
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
  }, []);

  return (
    <Router history={createBrowserHistory()}>
      <Switch>
        <Route exact path="/" component={Home}></Route>
      </Switch>
    </Router>
  );
}

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
