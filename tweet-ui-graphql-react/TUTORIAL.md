Main Concepts

1. Creating a grpahQL Service

2. Creating a consumer application for graphql

1. Setup

Pre-requisites
```
- [nodejs](https://nodejs.org/en/)
- [npm] (https://docs.npmjs.com/getting-started)
- [npx](https://www.npmjs.com/package/npx)
```

To walk through this tutorial, we recommend you either:

Create a new React project locally with Create React App, or

```
npx create-react-app voting-ui-graphql-client
```

```
cd voting-ui-graphql-client
```

Create a new React sandbox on CodeSandbox

```
npm install @apollo/client graphql
```

@apollo/client: This single package contains virtually everything you need to set up Apollo Client. It includes the in-memory cache, local state management, error handling, and a React-based view layer.
graphql: This package provides logic for parsing GraphQL queries.

Let's initialize a GrpahQL client side npm library. We will be using [ApolloClient](https://www.apollographql.com/docs/react/get-started/#2-initialize-apolloclient) as the GraphQL client library


Within index.js, import the client

```
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";


const client = new ApolloClient({
  uri: 'https://48p1r2roz4.sse.codesandbox.io',
  cache: new InMemoryCache()
});

client
  .query({
    query: gql`
      query GetRates {
        rates(currency: "USD") {
          currency
        }
      }
    `
  })
  .then(result => console.log(result));

```

uri specifies the URL of our GraphQL server.
cache is an instance of InMemoryCache, which Apollo Client uses to cache query results after fetching them.

That's it! Our client is ready to start fetching data. Now before we start using Apollo Client with React, let's first try sending a query with plain JavaScript.

In the same index.js file, call client.query() with the query string (wrapped in the gql template literal) shown below:


Let's run the application

```
npm start
```

Run this code, open your console, and inspect the result object. You should see a data property with rates attached, along with some other properties like loading and networkStatus. Nice!

Although executing GraphQL operations directly like this can be useful, Apollo Client really shines when it's integrated with a view layer like React. You can bind queries to your UI and update it automatically as new data is fetched.

Let's look at how that works!

Let's connect it to a view

```
```

### Attach the authorization bearer token to calls

https://www.apollographql.com/docs/react/networking/authentication/#header




2. Deploying service onto a K8s Cluster namespace

3. deploying caller application onto a different namespace

3. Protecting the service authorization using Cloudentity ACP

4. Apply enforcement to authorize real time traffic

## Adding dependencies

* First create a directory for your new application and navigate into it:

```
mkdir demo-voting-app
cd demo-voting-app

npm init

```

```
{
  "name": "myapp",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}

```

Install express

```
npm install express
```

```
npm install express-graphql
```

Reference: https://github.com/graphql/express-graphql


## Ready to code

### Expose GraphQL endpoint

### 

### Add a graphQL schema

### Add some mutations

### Add some mutations


Article for medium

https://www.loginradius.com/blog/async/run-multiple-nodejs-version-on-the-same-machine/

https://reactjs.org/docs/state-and-lifecycle.html


npm install @mui/material

Material ui for styling

@mui/material

npm install @emotion/styled
npm install @emotion/react
 npm install @mui/system


 https://onestepcode.com/creating-a-material-ui-form/

 proxy:
 https://www.stackhawk.com/blog/react-cors-guide-what-it-is-and-how-to-enable-it/

 https://www.sitepoint.com/loop-through-json-response-javascript/

 https://www.apollographql.com/docs/react/networking/authentication/

 // mulitple apollo clients


 https://www.loudnoises.us/next-js-two-apollo-clients-two-graphql-data-sources-the-easy-way/
 

