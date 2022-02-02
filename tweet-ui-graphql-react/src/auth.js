import {useState, useEffect} from 'react';
import authConfig from './authConfig.js';

export const useAuth = (auth) => {
  const [authenticated, setAuthentication] = useState(null);

  function removeQueryString() {
    if (window.location.href.split('?').length > 1) {
      window.history.replaceState({}, document.title, window.location.href.replace(/\?.*$/, ''));
    }
  }

  useEffect(() => {
    auth.getAuth().then((res) => {
      if (res) {
        console.log('auth response:', JSON.stringify(res));
        if (res.scope && res.scope.split(' ').length === 1 && res.scope.startsWith('dataset')) {
          window.localStorage.setItem(`${authConfig.accessTokenName}_${res.scope}`, res.access_token);
        } else {
          window.localStorage.setItem(authConfig.accessTokenName, res.access_token);
        }
        removeQueryString();
      }
      setAuthentication(true);
    })
    .catch((_authErr) => {
      setAuthentication(false);
      if (window.location.href.split('?error').length > 1) {
        if (authenticated === false) {
          //todo: add something here for error handling
        }
      } else {
        removeQueryString();
      }
    });
  });

  return [authenticated];
};