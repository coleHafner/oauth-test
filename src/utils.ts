import { createHash } from 'crypto';
import { VerifierPayload } from './types';
import * as uuid from 'uuid/v4';

export const getVerifier = (): VerifierPayload => {
  const verifier = uuid();
  return {
    verifier,
    challenge: createChallenge(verifier),
  };
};

export const createChallenge = (verifier: string): string => {
  const challenge = createHash('sha256')
    .update(verifier)
    .digest('base64');

  return challenge
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export const verifyChallenge = (verifier: string, expectedChallenge: string): boolean => 
  createChallenge(verifier) === expectedChallenge;