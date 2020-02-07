import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { LoginButton } from './Login';

import {
  extractUriParams,
  getAuthorizationUri,
  getOrRefreshOauthToken
} from '../utils';

import {
  local as ls,
  AUTH_CODE,
  AUTH_CHALLENGE,
  AUTH_VERIFIER,
  AUTH_STATE,
  AUTH_EXPIRES,
  AUTH_REFRESH_TOKEN,
  AUTH_TOKEN,
  AUTH_ID_TOKEN,
} from '../local-storage';

export const Auth = () => {
  const history = useHistory();
  const [error, setError] = useState('');

  const { actions: { login }} = useContext(AuthContext);
  
  useEffect(() => {
    (async () => {
      const expectedState = ls.get(AUTH_STATE);
      const {code, state} = extractUriParams(window.location.href);
      
      if (state !== expectedState) {
        throw new Error(`State "${state}" !== "${expectedState}". Cannot continue.`);
      }
      
      ls.set(AUTH_CODE, decodeURIComponent(code));

      const {uri, payload } = getAuthorizationUri(
        ls.get(AUTH_CODE) || '',
        ls.get(AUTH_VERIFIER) || '',
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

        login(() => {
          setTimeout(() => history.push('/home'), 500);
        });
      } catch (err) {
        console.log(`ERROR: ${err}`)
        setError('Error signing in!');
      }
    })();
  }, []);

  return error
    ? <h3 style={{color: 'red'}}>{error}</h3>
    : <LoginButton uri={''} loading={true} />;
}