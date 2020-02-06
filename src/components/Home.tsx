import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendProfileRequest } from '../utils';

import {
  local,
  PROFILE_EMAIL,
  PROFILE_NAME,
  PROFILE_PIC,
  AUTH_TOKEN,
} from '../local-storage';

const ls = local();

export const Home = function() {
  const history = useHistory();
  const [email, setEmail] = useState(ls.get(PROFILE_EMAIL));
  const [name, setName] = useState(ls.get(PROFILE_NAME));
  const [pic, setPic] = useState(ls.get(PROFILE_PIC));

  // @ts-ignore
  useEffect(async () => {
    if (!name || !pic || !email) {
      // make some kind of Google API call 
      const res = await sendProfileRequest(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        ls.get(AUTH_TOKEN),
      );

      setName(res.given_name);
      setEmail(res.email);
      setPic(res.picture);

      ls.set(PROFILE_NAME, res.given_name);
      ls.set(PROFILE_EMAIL, res.email);
      ls.set(PROFILE_PIC, res.picture);
    }
  }, []);

  const doLogout = function(e: React.SyntheticEvent) {
    e.preventDefault();
    ls.clear();
    history.go(0);
  }

  return (
    <>
      {name && email && 
        <div>
          {pic &&  <img src={pic} />}
          {name} - {email}
        </div>
      }
      <h1>Welcome, you are logged in!</h1>
      <a href="#" onClick={doLogout}>
        Logout
      </a>
    </>
  )
}
