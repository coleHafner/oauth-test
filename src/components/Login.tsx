import React, { useEffect, useState } from 'react';
import { getVerifier, getVerificationUri } from '../utils';

import {
  local as ls,
  AUTH_CHALLENGE,
  AUTH_STATE,
  AUTH_VERIFIER,
} from '../local-storage';

export const Login = () => {
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