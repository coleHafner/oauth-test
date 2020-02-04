import * as React from 'react';
import { getVerifier } from '../utils';

const startOAuth = (e: React.SyntheticEvent) => {
  e.preventDefault();
  const verifier = getVerifier();
}

export const App = () => (
  <button onClick={startOAuth}>
    Login with Google
  </button>
);
