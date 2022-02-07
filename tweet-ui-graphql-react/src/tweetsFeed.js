import React, { useState } from 'react';
import './index.css';

import {
  useQuery,
  gql
} from "@apollo/client";


const FETCH_LATEST_TWEETS = gql `
query {
    getLatestTweets {
        id,
        content,
        author,
        dateCreated
    }
  }
`;

const FETCH_LATEST_TWEETS_FOR_LOGGED_IN_USER = gql `
query {
    getLoggedInUserTweets {
        id,
        content
    }
  }
`;

function isError403(e)  {
   // console.log("Checkinf if the network error is a 403");
    if(e.networkError != null) {
        
        switch(e.networkError.statusCode) {
            case 403:
                return true;
                break;

             case 400:
                 return false;
                 break;
        }
    }

    return false;
}

export function GetLatestTweets() {
  const {loading, error, data} = useQuery(FETCH_LATEST_TWEETS);

  const  [latestTweetFetchStatus, setFetchLatestTweetsStatus] = useState(false);

  if (loading) return <p>Loading..</p>;
  if (error && isError403(error)) return (
    <div>
        <h2> Latest Tweets</h2>
        <p> Our systems have detected that this request is NOT authorized to see the tweets... </p>
        <p> Reason for unauthorized: </p>
        
    </div>
);
  if (error) return (
      <div>
          <h2> Latest Tweets</h2>
          <p> Unable to connect to GraphQL resource server ... </p>
          
      </div>
  );

  if(!latestTweetFetchStatus && data != null && data.getLatestTweets != null) {
      console.log("updating fetch status to true since data is not null ##########")
    setFetchLatestTweetsStatus(true);
  }

  if(latestTweetFetchStatus) {
    return (
      <div>
        <h2> Latest Tweets</h2>

        {
          Object.keys(data.getLatestTweets).map((k,i) => (
              <ul>
                  <div id={data.getLatestTweets[i].id}> 
                  <u> {data.getLatestTweets[i].dateCreated} : </u>
                  {data.getLatestTweets[i].author} tweeted <i> " {data.getLatestTweets[i].content}  "</i>
                 </div>
                
            </ul>
          ))
        }
      </div>
    );
  }
  return <TweetsNotAvailable />;  

}



export function GetLatestTweetsForLoggedInUser() {
    const {loading, error, data} = useQuery(FETCH_LATEST_TWEETS);
  
    const  [latestTweetFetchStatus, setFetchLatestTweetsStatus] = useState(false);
  
    if (loading) return <p>Loading..</p>;
    if (error) return (
        <div>
            <h2> Latest Tweets</h2>
            <p> System connection issues ...</p>
            <pre>Bad: {error.graphQLErrors.map(({ message }, i) => (
                <span key={i}>{message}</span>
            ))}
            </pre>
        </div>
    );
  
    if(!latestTweetFetchStatus && data != null && data.getLatestTweets != null) {
      setFetchLatestTweetsStatus(true);
    }
  
    if(latestTweetFetchStatus) {
      return (
        <div>
          <h2> Latest Tweets</h2>
  
          <p> Our records indicate that you have already exercised your ballot rights.
            In case you want to modify the ballot, click on modify below.
          </p>
  
          {
            Object.keys(data.getLatestTweets).map((k,i) => (
              <div>Hi {i} {k} {data.getLatestTweets[i].id} </div>
            ))
          }
  
         
        </div>
      );
    }
    return <TweetsNotAvailable />;  
  
  }


function TweetsNotAvailable() {
    return (
      <div>
          <h2> Latest Tweets </h2>
          <p> No tweets available for display!
          </p>
      </div>
    );
  }