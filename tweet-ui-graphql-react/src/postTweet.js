import React, { useState } from 'react';
import {useEffect} from 'react';

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import { useMutation, gql } from '@apollo/client';

import CloudentityAuth from '@cloudentity/auth';
import authConfig from './authConfig.js';

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

    const handleSubmit = (event) => {
      event.preventDefault();
      postTweetMutation();
      window.location.reload(false);
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