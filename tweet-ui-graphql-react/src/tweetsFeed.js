import React, { useState, Fragment } from 'react';
import './index.css';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ConfirmIcon from '@mui/icons-material/CheckCircle';
import TextField from "@mui/material/TextField";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import {
  useMutation,
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

const DELETE_TWEET_MUTATION = gql`
mutation DeleteTweetMutation(
    $id: String!
  ) {
    deleteTweet(id: $id)
  }
`;

function isError403(e)  {
   // Check if if the network error is a 403
    if(e.networkError != null) {

        switch(e.networkError.statusCode) {
            case 403:
                return true;
             default:
                 return false;
        }
    }
    return false;
}

export function GetLatestTweets({auth}) {
  const {loading, error, data} = useQuery(FETCH_LATEST_TWEETS);

  const [latestTweetFetchStatus, setFetchLatestTweetsStatus] = useState(false);
  const [currentlyEditing, setCurrentlyEditing] = useState('');
  const [editText, setEditText] = useState('');
  const [currentlyDeleting, setCurrentlyDeleting] = useState('')
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

  const handleStartEdit = (id, content) => {
    setCurrentlyEditing(id);
    setEditText(content);
  }

  const handleConfirmEdit = () => {
    console.log('id to edit:', currentlyEditing);
    console.log('content to edit:', editText);
    // TODO: add edit mutation call, refresh list
    setCurrentlyEditing('');
    setEditText('');
    window.location.reload(false);
  }

  const handleCancelEdit = () => {
    setCurrentlyEditing('');
    setEditText('');
  }

  const [deleteTweetMutation] =
    useMutation(DELETE_TWEET_MUTATION, {
      variables: {
        id: currentlyDeleting
      }
    })

  const handleDeleteTweet = (id) => {
    console.log('Deleting this tweet id:', id);
    setConfirmDeleteDialogOpen(true);
    setCurrentlyDeleting(id);
  }

  const handleConfirmDelete = () => {
    deleteTweetMutation();
    setConfirmDeleteDialogOpen(false);
    setCurrentlyDeleting('');
    window.location.reload(false);
  }

  const handleCancelDelete = () => {
    setConfirmDeleteDialogOpen(false);
    setCurrentlyDeleting('');
  }

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
        <ul>
        {
          Object.keys(data.getLatestTweets).map((k,i) => (
            <div style={{marginTop: 15, display: 'flex', flexDirection: 'row'}} key={i} id={data.getLatestTweets[i].id}>
            {currentlyEditing === data.getLatestTweets[i].id ? (
              <Fragment>
                <div>
                  Edit this tweet:
                </div>
                <div style={{marginLeft: 15}}>
                  <TextField value={editText} name="content" placeholder="" multiline rows={2} onChange={(e) => setEditText(e.target.value)}/>
                </div>
                <div style={{marginLeft: 10, marginTop: -12}}>
                  <Stack direction="row" spacing={1}>
                    <IconButton aria-label="cancel" onClick={handleConfirmEdit}>
                      <ConfirmIcon />
                    </IconButton>
                    <IconButton aria-label="cancel" onClick={handleCancelEdit}>
                      <CancelIcon />
                    </IconButton>
                  </Stack>
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div>
                  <u> {data.getLatestTweets[i].dateCreated} :</u>
                  <span> {data.getLatestTweets[i].author} tweeted <i> " {data.getLatestTweets[i].content} "</i></span>
                </div>
                {auth && (
                  <div style={{marginLeft: 10, marginTop: -12}}>
                    <Stack direction="row" spacing={1}>
                      <IconButton aria-label="edit" onClick={() => handleStartEdit(data.getLatestTweets[i].id, data.getLatestTweets[i].content)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label="delete" onClick={() => handleDeleteTweet(data.getLatestTweets[i].id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </div>
                )}
              </Fragment>
            )}
            </div>
          ))
        }
        </ul>
        <div>
          <Dialog
            open={confirmDeleteDialogOpen}
            onClose={handleCancelDelete}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Delete this tweet?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This tweet will be permanently deleted.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={handleConfirmDelete} autoFocus>
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
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
