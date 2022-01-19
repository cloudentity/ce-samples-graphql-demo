import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
import { render } from 'react-dom';
import { setContext } from '@apollo/client/link/context';

import reportWebVitals from './reportWebVitals';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  createHttpLink,
  gql,
  from
} from "@apollo/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate } from "react-router-dom";


import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import styled from '@material-ui/core/styles/styled';

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

import TextField from "@mui/material/TextField";

import {HomePageContent} from './homePage.js';
import {LandingContent} from './landing.js';
import { TodayOutlined } from '@material-ui/icons';

import CloudentityAuth from '@cloudentity/auth';
import authConfig from './authConfig.js';
import { useAuth } from './auth.js';

import { onError } from "@apollo/client/link/error";
  

//const client = new ApolloClient({
//  uri: 'http://localhost:3000/graphql-voting',
//  cache: new InMemoryCache()
//});

function App() {

  //const navigate = useNavigate();
  const cloudentity = new CloudentityAuth(authConfig);
  const [authenticated] = useAuth(cloudentity);
  const accessTokenRaw = localStorage.getItem(authConfig.accessTokenName);
  const auth = authenticated && accessTokenRaw;

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/vote" element={<VotingPage/>}>
          </Route>
          <Route path="/authenticateduser"  element={<LandingContent/>}>
          </Route>
          <Route path="/"  element={!auth ? <HomePageContent auth={auth} /> : <Navigate to='/authenticateduser' /> }>
          </Route>
        </Routes>
      </div>
    </Router>
  );

}

function Home() {
  return <h2>Home</h2>;
}

function Vote() {
  return <h2>My Vote</h2>
}


function CastedVote() {
  return <h2>Cast Vote</h2>
}

function VotingPage() {
 return (
   <div>

      <VoteCount />
      <CastVote />
      <GetVote />
   </div>
   
 );
}


// <React.Fragment>
//     <CastVote />
//     <CastedVote />
//   </React.Fragment>


const GET_VOTE = gql `
query {
  getMyVote {
      id
      candidateId
      voterId
      districtId
      stateId
  }
  getVote(id: "3c412454-b267-44c8-9b66-05e4a3784d10") {
      id
  }
}
`;

export function GetVote() {
  const {loading, error, data} = useQuery(GET_VOTE);

  const  [ballotState, setBallotStatus] = useState(false);

  if (loading) return <p>Loading..</p>;
  if (error) return <p> Error ..</p>;

  if(!ballotState && data != null && data.getMyVote != null) {
    setBallotStatus(true);
  }

  if(ballotState) {
    return (
      <div>
        <h2> Ballot Status </h2>

        <p> Our records indicate that you have already exercised your ballot rights.
          In case you want to modify the ballot, click on modify below.
        </p>

        {
          Object.keys(data.getMyVote).map((k,i) => (
            <div>Hi {i} {k} {data.getMyVote[k]} </div>
          ))
        }
      </div>
    );
  }
  return <BallotNotCast />;  

}

function BallotNotCast() {
  return (
    <div>
        <h2> Ballot Status </h2>
        <p> Our records indicate that you have not  exercised your ballot rights.
          Please cast your ballot, it is your responsbility.
        </p>
    </div>
  );
}


const httpLink = createHttpLink(
  {
    uri: 'graphql',
    credentials: 'same-origin'
  }
);

const authLink = setContext( (_, {headers}) => {
  // get the authentication token from local storage if it exists
  //const token = localStorage.getItem('token');

 // const token = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjE0NTczMTAyMTA4MzA5MDcwNTQ3NjY2ODE3ODg2MjM1MjU3NDg1NyIsInR5cCI6IkpXVCJ9.eyJhaWQiOiJkZWZhdWx0IiwiYW1yIjpbXSwiYXVkIjpbImMzbjNiazBwMmxuMGNmZGdoOHAwIiwic3BpZmZlOi9ydGVzdC9kZWZhdWx0L2MydGIwYzJsOGZ0bDBnNHFiN21nIl0sImV4cCI6MTYyNjI0MzI1OCwiaWF0IjoxNjI2MjM5NjU4LCJpZHAiOiIiLCJpc3MiOiJodHRwczovL3J0ZXN0LmF1dGh6LmNsb3VkZW50aXR5LmlvL3J0ZXN0L2RlZmF1bHQiLCJqdGkiOiI3OTJkMmE3Yy1lZGYyLTQyODMtOGZlNy0zMTkxZmM3ZTJmNTEiLCJuYmYiOjE2MjYyMzk2NTgsInNjcCI6WyJpbnRyb3NwZWN0X3Rva2VucyIsInJldm9rZV90b2tlbnMiXSwic3QiOiJwdWJsaWMiLCJzdWIiOiJjM24zYmswcDJsbjBjZmRnaDhwMCIsInRpZCI6InJ0ZXN0In0.bMjr0bPinYFdTr4thKdTXEoOJmwRut-JH004U2H-Gjf6atTFtjkb3gyZfNOFJ5zM-t3M3yvh-49zG_7sFBU0Ig';

 const accessTokenRaw = localStorage.getItem(authConfig.accessTokenName);
  //return the headers to the context so httpLink can read them

  return {
    headers: {
      ...headers,
      authorization: accessTokenRaw ? `Bearer ${accessTokenRaw}`: "",
    }
  }
});

//https://www.apollographql.com/docs/react/api/link/apollo-link-error/
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});


const client = new ApolloClient (
  {
    link: from([authLink, errorLink, httpLink]), 
    cache: new InMemoryCache()
  }
);





function VoteCount(props) {
  return (
    <div>
      <h2> Vote Count Status </h2>
    </div>
  );
}

const defaultValues = {
  name: "",
  age: 0,
  gender: "",
  os: "",
  favoriteNumber: 0,
};

export function CastVote(props) {
  
    const  [formValues, setFormValues] = useState(defaultValues);
  
    const handleSliderChange = (name) => (e, value) => {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    };
    
    const handleSubmit = (event) => {
      event.preventDefault();
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
        <h2>Cast Vote</h2>
        <form>
        <Grid container alignItems="center" justify="center" direction="column">
          <Grid item>
              <p>Hi voter, as per our records you have not casted the ballot yet. Please
                use the submission below to cast your vote.
              </p>
              <p>
                Our records show following demographics details for your ballot. If there is 
                any issue please contact a voting official for help.
              </p>
              <p>Name: {formValues.name} </p>
              <p>State: {formValues.state} </p>
              <p>County: {formValues.county} </p>
              <p>Address: {formValues.address} </p>
              <p>Type: {formValues.remote} </p>
          </Grid>
          <Grid item>
              
          </Grid>
          <Grid item>
            <FormControl component="fieldset">
              <FormLabel component="legend">Choose a candidate</FormLabel>
              <RadioGroup
                aria-label="candidate"
                defaultValue=""
                name="radio-buttons-group"
              >
                <FormControlLabel value="Bob" control={<Radio />} label="Bob" />
                <FormControlLabel value="Roy" control={<Radio />} label="Roy" />
                <FormControlLabel value="Jack" control={<Radio />} label="Jack" />
                <FormControlLabel value="Ryan" control={<Radio />} label="Ryan" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" type="submit">
                Cast ballot
            </Button>
        </Grid>
        </Grid>
        </form>
      </div>
  );
}


render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);



//ReactDOM.render(
//  <React.StrictMode>
//    <App />
//  </React.StrictMode>,
//  document.getElementById('root')
//);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
