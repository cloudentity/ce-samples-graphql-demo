import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import styled from '@material-ui/core/styles/styled';

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

import TextField from "@mui/material/TextField";

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

import CloudentityAuth from '@cloudentity/auth';
import authConfig from './authConfig.js';
import { useAuth } from './auth.js';

import {useEffect} from 'react';

const CREATE_TWEET_MUTATION = gql`
mutation PostTweetMutation(
    $content: String!
    $author: String!
  ) {
    createTweet(tweet: {content: $content, author: $author}) {
      id
    }
  }
`;


const tweetPostDefaultValues = {
    name: "",
    age: 0,
    gender: "",
    os: "",
    favoriteNumber: 0,
  };


  export const usePostTweetAuthorization = (auth) => {
    const [accessTokenSet, setPostTweetAccessToken] = useState(null);
   // const {enqueueSnackbar} = useSnackbar();
  
    function removeQueryString() {
      if (window.location.href.split('?').length > 1) {
        window.history.replaceState({}, document.title, window.location.href.replace(/\?.*$/, ''));
      }
    }
  
    useEffect(() => {
        auth.getAuth().then((res) => {
        if (res) {
          console.log('auth response from here:', JSON.stringify(res));
            window.localStorage.setItem("pt-access-Token", res.access_token);
          removeQueryString();
        }
        setPostTweetAccessToken(true);
      })
      .catch((_authErr) => {
        setPostTweetAccessToken(false);
        if (window.location.href.split('?error').length > 1) {
          if (accessTokenSet === false) {
            //todo: add something here for error handling
          }
        } else {
          removeQueryString();
        }
      });
    });
  
    return [accessTokenSet];
  };

export function PostTweet(props) {

    const cloudentityAuthConfigForPost = new CloudentityAuth(authConfig);
    const [authorizedForPost] = usePostTweetAuthorization(cloudentityAuthConfigForPost);
    const accessTokenForPost = localStorage.getItem("pt-access-Token");
    const authForPost = authorizedForPost && accessTokenForPost;
  
    const  [formValues, setFormValues] = useState(tweetPostDefaultValues);
  
    const handleSliderChange = (name) => (e, value) => {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    };

    //https://www.howtographql.com/react-apollo/3-mutations-creating-links/

    const [postTweetMutation] = useMutation(CREATE_TWEET_MUTATION, {
        variables: {
            content: formValues.name,
          author: formValues.gender
        }
      });

      const handleAuthorizationAccessTokenFetch = () => {
        const scopes = 'all';
        console.log("asdfsafdds##########");
        console.log(authConfig);

        const authConfigForPostTweet = {
            domain: 'rtest.authz.cloudentity.io', // e.g. 'example.demo.cloudentity.com.' Recommended; always generates URLs with 'https' protocol.
             // baseUrl: optional alternative to 'domain.' Protocol required, e.g. 'https://example.demo.cloudentity.com.'
             // In situations where protocol may dynamically resolve to 'http' rather than 'https' (for example in dev mode), use 'baseUrl' rather than 'domain'.
             tenantId: 'rtest',
             authorizationServerId: 'ce-dev-playground-integrations',
             clientId: 'c7e6u0eer3qh0m4pggig',
             redirectUri: 'http://localhost:3000/posttweet',
             silentAuthRedirectUri: 'window.location.href' + '/silent', // optional setting to redirect to a different endpoint following successful silent auth flow
             userInfoUri: 'https://rtest.authz.cloudentity.io/rtest/ce-dev-playground-integrations/userinfo', // optional, for fetching user info via API
             scopes: ['profile'], // 'revoke_tokens' scope must be present for 'logout' action to revoke token! Without it, token will only be deleted from browser's local storage.
             letClientSetAccessToken: true,
             accessTokenName: 'pt_access_token', // optional; defaults to '{tenantId}_{authorizationServerId}_access_token'
             idTokenName: 'ins_demo_id_token', // optional; defaults to '{tenantId}_{authorizationServerId}_id_token'
         
         };


       // const cloudentity = new CloudentityAuth({...authConfig, ...scopes});
       const cloudentityAuthConfigForPost = new CloudentityAuth(authConfigForPostTweet);
       cloudentityAuthConfigForPost.getAuth().then(
        function (authResponse) {
            // set authenticated state in client app, use oauth data, etc.
            // access token (and id token, if present) are automatically set in browser's local storage,
            // so there may be no need for the client app to handle the response data, unless there are custom requirements

            console.log("Authorized found an access Token");

          },
        
          function (errorResponse) {
            // user is not authorized
            // set unauthenticated state, redirect to login, etc.

            console.log("Unatuhorized cannot find an access Token");

            cloudentityAuthConfigForPost.authorize();

            usePostTweetAuthorization(cloudentityAuthConfigForPost);
          }
       );
        
      };
    
    const handleSubmit = (event) => {
      event.preventDefault();

      // get a new authorization token at this point(make sure the tweet is not lost as well)

      postTweetMutation();
      window.location.reload(false);
      handleAuthorizationAccessTokenFetch();
      console.log(formValues);
    };
  
  
    const  handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormValues({
        ...formValues,
        [name]: value,
      });
    };
  
  return (
  <div>
        <h2>Post Tweet</h2>
        <form onSubmit= {handleSubmit} >
        <Grid container alignItems="center" justify="center" direction="column">
          <Grid item>
              <p>Hi user, let's create a tweet.
              </p>
          </Grid>
          <Grid item>
              
          </Grid>
          <Grid item>
                        <TextField
                placeholder="MultiLine with rows: 2 and rowsMax: 4"
                multiline
                rows={2}
                maxRows={4}
                />
          </Grid>

          <Grid item>
            <Button variant="contained" color="primary" type="submit">
                Post tweet
            </Button>
        </Grid>
        </Grid>
        </form>
      </div>
  );
}