import { createChallenge, getVerifier, verifyChallenge } from '../src/utils';

describe('oAuth Test - Utils', () => {
  const from = '3bbcee75-cecc-5b56-8031-b6641c1ed1f1';
  const to = '0xZF_LVZig8Yq5biVp90Q8VgqOoKqmkVr2EnCpxwLno';

  test('should create challenge', () => {
    expect(createChallenge(from)).toEqual(to);
  });

  test('should create verifier', () => {
    const pkce = getVerifier();
    expect(pkce).toHaveProperty('verifier');
    expect(pkce).toHaveProperty('challenge');
  });

  test('should verify challenge', () => {
    expect(verifyChallenge(from, to)).toEqual(true);
    expect(verifyChallenge(from, 'wrong')).toEqual(false);
  })
});
