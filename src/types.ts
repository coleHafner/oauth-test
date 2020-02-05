export type VerifierPayload = {
  code_verifier: string;
  code_challenge: string;
};

export type UriParams = {[key: string]: string};