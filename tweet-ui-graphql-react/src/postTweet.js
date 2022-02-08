import React, { useState, useEffect } from 'react';

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import jwt_decode from "jwt-decode";

import { useMutation, gql } from '@apollo/client';

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

export function PostTweet({auth}) {

    const tweetPostDefaultValues = {
      content: "",
      author: window.localStorage.getItem('ins_demo_id_token') ? jwt_decode(window.localStorage.getItem('ins_demo_id_token')).sub : 'anonymous'
    };

    const [formValues, setFormValues] = useState(tweetPostDefaultValues);

    //https://www.howtographql.com/react-apollo/3-mutations-creating-links/

    const [postTweetMutation] =
      useMutation(CREATE_TWEET_MUTATION, {
        variables: {
          content: formValues.content,
          author:  formValues.author
        }
      })

    const handleSubmit = (event) => {
      event.preventDefault();
      postTweetMutation();
      window.location.reload(false);
    };


    const  handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormValues({
        ...formValues,
        [name]: value,
      });
    };

    useEffect(() => {}, [formValues]);

  return (
    <div>
      <h2>Post Tweet</h2>
      <form onSubmit= {handleSubmit} >
        <Grid container alignItems="center" justify="center" direction="column">
          <Grid item>
            <p>Hi {formValues.author}, let's create a tweet.</p>
          </Grid>
          <Grid item>

          </Grid>
          <Grid item>
            <TextField name="content" placeholder="" multiline rows={2} onChange={handleInputChange}/>
          </Grid>
          <Grid item>

          </Grid>

          <Grid item>
            <Button variant="contained" color="primary" type="submit" style={{marginTop: 10}}>
                Post tweet
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}
