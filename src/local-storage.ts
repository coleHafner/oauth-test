
export const AUTH_VERIFIER = 'auth-verifier';
export const AUTH_STATE = 'auth-state';
export const AUTH_CHALLENGE = 'auth-challenge';
export const AUTH_CODE = 'auth-code';
export const AUTH_REFRESH_TOKEN = 'auth-refresh-token';
export const AUTH_TOKEN = 'auth-token';
export const AUTH_EXPIRES = 'auth-expires-utc';
export const AUTH_ID_TOKEN = 'auth-id-token';
export const PROFILE_NAME = 'profile-name';
export const PROFILE_PIC = 'profile-picture';
export const PROFILE_EMAIL = 'profile-email';

export const local = (): any => {
  const STORAGE_KEY = 'oauth-test';

  const getSession = (): {[key: string]: string} => 
    JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");

  const setSession = (session: {[key: string]: string}): void => 
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  let session = getSession();

  return {
    clear: () => setSession({}),
    get: (key: string): string|undefined => session[key],
    set: (key: string, val: string): any => {
      session[key] = val;
      setSession(session);
      return session;
    },
    setAll: (toMerge: any): any => {
      session = {
        ...session,
        ...toMerge,
      };
      setSession(session);
      return session;
    }
  }
}
