import { VerifierPayload, UriParams, TokenPayload } from './types';
import axios from 'axios';

const pkceChallenge = require('pkce-challenge');
const { verifyChallenge } = require('pkce-challenge');

export const getVerificationUri = (
  clientId: string, 
  redirectUri: string, 
  challengeToken: string, 
  state?: string
): string => 
  buildUri(
    'https://accounts.google.com/o/oauth2/v2/auth', {
      code_challenge_method: 'S256',
      scope: 'email profile',
      access_type: 'offline',
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: challengeToken,
      ...(state ? {state} : null),
    }
  );

export const extractUriParams = (uri: string) => {
  if (uri.indexOf('?') === -1) {
    throw new Error('URI does not have question mark. Cannot continue.');
  }

  const params: {[key: string]: string} = {};

  uri.split('?')[1].split('&').map(part => {
    const split: string[] = part.split('=');
    params[split[0]] = split[1];
  })

  return params;
};

export const getAuthorizationUri = (
  authCode: string,
  codeVerifier: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): {uri: string, payload: string} => {
  const payloadRaw: {[key: string]: string} = {
    code: authCode,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  };

  const payload = Object
    .keys(payloadRaw)
    .map(key => `${key}=${encodeURI(payloadRaw[key])}`)
    .join('&');

  return { 
    uri: 'https://oauth2.googleapis.com/token', 
    payload 
  };
}

export const getOauthToken = (uri: string, payload: string): Promise<TokenPayload> =>
  new Promise((resolve, reject) =>
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
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      })
  )

export const buildUri = (base: string, params: UriParams): string =>
  `${base}?${Object.keys(params).map(key => key + '=' + encodeURI(params[key])).join('&')}`;

export const doVerifyChallenge = (verifier: string, expectedChallenge: string): boolean => 
  verifyChallenge(verifier, expectedChallenge);

export const getVerifier = (): VerifierPayload => 
  pkceChallenge();
