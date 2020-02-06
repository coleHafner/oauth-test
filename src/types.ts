export type VerifierPayload = {
  code_verifier: string;
  code_challenge: string;
};

export type UriParams = {[key: string]: string};

export type TokenPayload = {
  access_token: string,
  refresh_token: string,
  expires_in: string,
  id_token?: string
}

export type ProfilePayload = {
  given_name: string,
  picture: string,
  email: string,
}