import { getVerifier, doVerifyChallenge, getVerificationUri, getAuthorizationUri, extractUriParams } from '../src/utils';

describe('oAuth Test - Utils', () => {
  test('should create verifier', () => {
    const pkce = getVerifier();
    expect(pkce.code_verifier.length >= 43).toBeTruthy();
    expect(pkce.code_verifier.length <= 128).toBeTruthy();
    expect(pkce).toHaveProperty('code_verifier');
    expect(pkce).toHaveProperty('code_challenge');
  });

  test('should verify challenge', () => {
    const { code_verifier: verifier, code_challenge: challenge } = getVerifier();
    expect(doVerifyChallenge(verifier, challenge)).toEqual(true);
    expect(doVerifyChallenge(verifier, 'wrong')).toEqual(false);
  });

  test('should generate verification uri', () => {
    const clientId = 'client';
    const redirectUri = 'https://localhost/grab-oauth-token';
    const challenge = '234234lkjafdslkj235lksajfd'
    const actual = getVerificationUri(clientId, redirectUri, challenge);
    const expected = `https://accounts.google.com/o/oauth2/v2/auth?code_challenge_method=S256&scope=email%20profile&response_type=code&client_id=${clientId}&redirect_uri=${encodeURI(redirectUri)}&code_challenge=${challenge}`;
    expect(actual).toEqual(expected);

    const state = 'this is my state';
    const actualWithState = getVerificationUri(clientId, redirectUri, challenge, state);
    const expectedWithState = `${expected}&state=this%20is%20my%20state`;
    expect(actualWithState).toEqual(expectedWithState);
  });

  test('should be able to extract uri params', () => {
    const uri = 'https://localhost/auth?state=702697.2703593444&code=4%2FwAETSEeXA5d_GWYaQ2lQ5gx7pLdHKw36t9R2D6SwsilwPEJQjVLHcQWPtRSa4_5_OKXZ6DQpT9mTH2hyL5WCgrE&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&prompt=consent&session_state=84775d83209cafa02f180bff929bfe14303742c5..d34b#';
    const actual = extractUriParams(uri);
    expect(actual).toHaveProperty('state');
    expect(actual).toHaveProperty('code');
    expect(actual).toHaveProperty('authuser');
    expect(actual).toHaveProperty('prompt');
    expect(actual).toHaveProperty('session_state');
  });

  test('should throw error if URI has no params', () => {
    try {
      extractUriParams('https://no-params.guru');
    } catch(err) {
      expect(err).toMatchObject(new Error('URI does not have question mark. Cannot continue.'));
    }
  });
});
