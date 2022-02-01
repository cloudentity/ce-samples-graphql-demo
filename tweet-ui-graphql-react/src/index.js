import React from 'react';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { render } from 'react-dom';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from "react-router-dom";



  import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    createHttpLink,
    from
  } from "@apollo/client";
  import { setContext } from '@apollo/client/link/context';
  import { onError } from "@apollo/client/link/error";


  import {UserTweets} from './usertweets.js';

  import CloudentityAuth from '@cloudentity/auth';
  import authConfig from './authConfig.js';
  import { useAuth } from './auth.js';

  import {HomePageContent} from './homePage.js';


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
          <Route path="/usertweet"  element={<UserTweets/>}>
            
          </Route>
          <Route path="/usertweet1"  element={!auth ?<HomePageContent auth={auth} /> : <Navigate to='/usertweet' /> }></Route>
          <Route path="/"  element={!auth ? <HomePageContent auth={auth} /> : <Navigate to='/usertweet' /> }>
          </Route>
        </Routes>
      </div>
    </Router>
  );

}

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
