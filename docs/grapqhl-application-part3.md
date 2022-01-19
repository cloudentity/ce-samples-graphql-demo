# Build and Secure a GraphQL based application

This article is part 3 of a series(part 1, part 2, part 3 and part 4) wherein we dive into depths of securing GraphQL application.

Part1: Build a graphql server with Nodejs and protect with Clouedntity authorization platform
Part 2. Build a graphql client application to consume graphQL server resource and protect with Cloudentity authorization platform.


This article is to showcase usage of a Graphql client that passes on end user authentication to call underlying services and handle the authorization token to underlying GrpahQL services that we added
 and has protected using Cloudentity ACP in part 2

## Build a single page React app with  with Nodejs and protect with Clouedntity authorization platform

We will be building the graphql server with nodejs express graphql and loki as a built in database for this
demonstration. The goal of this article is to build a graphql server and have its endpoint protected.

We will be deploying this application to a native kubernetes cluster using `kind` and enforcing centralized
and decoupled authorization without changing any business logic or code.

Full source code can be found at: <>

### Pre-requsisites

We will be using `nodejs` for the application development.

```
- [nodejs](https://nodejs.org/en/) - Recommended v16.0 +
- [npm] (https://docs.npmjs.com/getting-started) - Recommended v8.3.0 +
```

### Initialize the project

```
mkdir tweet-service-graphql-nodejs
npm init
```

NOTE: Click enter with no input for all prompts during npm init and finally tyoe `yes` for the OK prompt

Now we are set to start developing the graphQL service.

### Create the nodejs server

* Create index.js and add basic routing

```
var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.send('Let's build something!')
});

app.get('/health', function(req, res) {
	res.send('Service is alive and healthy')
});

app.listen(5001);
console.log("Server listening at http://localhost:5001/");

```

* Install dependencies

```
npm install express
```

* Update package.json

Add a`start` command to scripts section in `package.json` to start the app quickly

```
{
  "name": "tweet-service-graphql-nodejs",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  "author": "",
  "license": "ISC"
}

```

* Check the app

```
npm start
```

This should start the node app and below endpoitns should be available

```
http://localhost:5001
http://localhost:5001/health
```

Attach output


### Add GraphQL capabilites to the nodejs server

We will be using `express-graphql` implementation to serve the GraphQL API requests.
Let's attach a listener endpoint for graphQL. 

NOTE: In contrast to REST, GrpahQL is designed to be a single endpoint API system.

* Install npm packages for graphql support

```
npm install graphql express-graphql
```

* Import packages in index.js

```
//graphql package import
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
```

* Define a GraphQL schema

In this demonstration, we will be using some query, mutations to act on some objects
for a tweet service.

Add below block to index.js

```
//graphql schema definition
var schema = buildSchema(
	`
	input TweetInput {
		content: String
		author: String
	  }

	type Tweet {
		id: String
		content: String
		dateCreated: String
		author: String
	}

	type Query {
		hello: String
		getTweet(id: String!) : Tweet
		getLatestTweets : [Tweet]
	}

	type Mutation {
		createSimpleMessage(message: String): Tweet
		createTweet(tweet: TweetInput): Tweet
		updateTweet(id: String!, tweet: TweetInput): Tweet
	}`
);
```

* Add function to serve the implementation

We will add only to serve one query and we will expand later

```
var resolverRoot = {
	hello: () => {
	return 'Hello Tweety';
    }
};
```

* Update index.js to accept GraphQL based traffic

```
app.use('/graphql', graphqlHTTP(
{
	schema: schema,
	rootValue: resolverRoot,
	graphiql: true

}
));

```

* Launch the

```
npm start
```

```
http://localhost:5001/graphql
```

sicne the graphiql is set to true, we do see an interactive query screen and schema explorer. We will not be using this interface but the postman interface for further interaction with graphql API's.

Download postman

* Create new request of type GraphQL

You should see the following response from GraphQL

```
{
    "data": {
        "hello": "Hello Tweety"
    }
}
```

### Add business capabilites to this system

We are not going to dive intot he specifics, but we will be adding a simple in memory
datastore to store the tweets and then add some mutations and queries on these.

Our main goal is to showcase authorization to these various objects, queries and mutations etc

* Install dependencies

```
npm install uuid lokijs
```

* Import packages

```
var loki = require('lokijs');
const {v4: uuidv4} = require('uuid');
```

* Update business logic

```
var db = new loki('example.db');
var tweets = db.addCollection('tweets');

const getTweet = (tid) => {
	console.log("Fetching record..");
	var tweets = db.addCollection('tweets');
	var results = tweets.find({id: tid.id});
	var res = results.length > 0 ? results[0] : null
	return res;
}

const storeTweet = (t) => {
	tweets.insert(
		{
			id: t.id,
			content: t.content,
			author: t.author,
			dateCreated: t.dateCreated
		}
	);
	console.log(tweets);
	return t;
}

function Tweet(input) {
	this.id = uuidv4();
	this.content = input.tweet.content;
	this.author = input.tweet.author;
	this.dateCreated = new Date().toLocaleString();
	this.dateModified = new Date().toLocaleString();
}

var resolverRoot = {
	hello: () => {
	    return 'Hello Tweety';
    },
    getTweet: (tid) =>  {
		console.log("Fetching tweet using id: " + Object.values(tid));
		return getTweet(tid);
	},
	createTweet: (input) =>  {
		console.log("Creating a new tweet...");
		console.log(input);
		const newTweet = new Tweet(input);
		storeTweet(newTweet);
		return newTweet;
	},
	getLatestTweets: () => {
		console.log("Fetching records..");
		var tweets = db.getCollection('tweets');
		var all = tweets.find({ 'id': { '$ne': null } });
		return all;
	}
};

```

### Let's deploy the app like a production application

In this article, we want to demonstrate how the application will be protected eventually in a production like environment and protect its endpoints.

So let's build a docker container image and deploy to a local kubernetes cluster. So for this the pre-requisistes are

```
docker
kind
```

Let's build a quick docker image. There is a makefile for reference that can be used to build the docker
or use

`docker build . -t tweet-service-graphql-nodejs`

* Let's launch a kind cluster and deploy the app

`make deploy-cluster`

`make upload-image`

* Let's see if the service is accessible

Let's exec into the pod container to see if the service is reachable

```kubectl exec -it svc-apps-graphql-tweet-service-graphql-nodejs-8457684f9f-lnqrd /bin/sh -n svc-apps-graph-ns
```

and run

```
curl --location --request POST 'http://localhost:5001/graphql' \
--header 'Content-Type: application/json' \
--data-raw '{"query":"query {\n    hello\n}","variables":{}}'
```

```
{"data":{"hello":"Hello Tweety"}}
```

Now the service is running inside the pod but is not accessible outside since the service type is of ClusterIP. That means this service is accessible onlt inside the Kubernetes cluster.

Let's expose it for external access using an Istio ingress gateway. For that let;s install Istio onto this cluster

* Let's deploy Istio as well on the cluster

Check if gateway and virtual service is enabled

```
kubectl get gateways -A

kubectl get virtualservices -A
```

Let's see if we can access the service now from outside

#### Expose the Service Mesh with Istio Ingress Gateway

# https://ibm-developer.gitbook.io/cloudpakforapplications-appmod/microservices-development/istio101/exercise-5

The components deployed on the service mesh by default are not exposed outside the cluster. External access to individual services so far has been provided by creating an external load balancer or node port on each service.
An Ingress Gateway resource can be created to allow external requests through the Istio Ingress Gateway to the backing services.

> tweet-service-graphql-nodejs $ curl --location --request POST 'http://localhost:5001/graphql' --header 'Host: local.cloudentity.com' --header 'Content-Type: application/json' --data-raw '{"query":"query {\n    hello\n}","variables":{}}'
{"data":{"hello":"Hello Tweety"}}
> tweet-service-graphql-nodejs $ curl --location --request POST 'http://localhost:5001/graphql' --header 'Content-Type: application/json' --data-raw '{"query":"query {\n    hello\n}","variables":{}}'
> tweet-service-graphql-nodejs $ curl --location --request POST 'http://local.cloudentity.com:5001/graphql' --header 'Content-Type: application/json' --data-raw '{"query":"query {\n    hello\n}","variables":{}}'
{"data":{"hello":"Hello Tweety"}}



### Protect with Cloudentity

* Sign for a free Cloudentity SaaS account
* Download the pdp for local enforcement

* Make the service visible

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: countries
  labels:
    app: countries
  annotations:
    services.k8s.cloudentity.com/spec-url: "https://example.com/schema.graphql"
    services.k8s.cloudentity.com/graphql-path: "/graphql"

```
https://docs.authorization.cloudentity.com/guides/developer/protect/istio/graphql/#graphql-api-discovery


* Edit isto config map to add custom authorizer

```
kubectl edit configmap istio -n istio-system
```
Add following block to extension provider

```
data:
  mesh: |-
    extensionProviders:
    - name: "acp-authorizer"
      envoyExtAuthzGrpc:
        service: "istio-authorizer.acp-system.svc.cluster.local"
        port: "9001"    
```

NOTE that the service is the authorizer that will be deployed to its own name space (in this case `acp-system`)

. FInal Sample config
```
apiVersion: v1
data:
  mesh: |-
    defaultConfig:
      discoveryAddress: istiod.istio-system.svc:15012
      tracing:
        zipkin:
          address: zipkin.istio-system:9411
    extensionProviders:
    - name: "acp-authorizer"
      envoyExtAuthzGrpc:
        service: "istio-authorizer.acp-system.svc.cluster.local"
        port: "9001"
    enablePrometheusMerge: true
    rootNamespace: istio-system
    trustDomain: cluster.local
  meshNetworks: 'networks: {}'
kind: ConfigMap
metadata:
  creationTimestamp: "2022-01-11T20:02:58Z"
  labels:
    install.operator.istio.io/owning-resource: unknown
    istio.io/rev: default
    operator.istio.io/component: Pilot
    release: istiod
  managedFields:
  - apiVersion: v1
    fieldsType: FieldsV1
    fieldsV1:
      f:data:
        .: {}
        f:mesh: {}
        f:meshNetworks: {}
      f:metadata:
        f:labels:
          .: {}
          f:install.operator.istio.io/owning-resource: {}
          f:istio.io/rev: {}
          f:operator.istio.io/component: {}
          f:release: {}
    manager: Go-http-client
    operation: Update
    time: "2022-01-11T20:02:58Z"
  name: istio
  namespace: istio-system
  resourceVersion: "5345"
  selfLink: /api/v1/namespaces/istio-system/configmaps/istio
  uid: d0201eb4-bf46-4322-bb6c-1dd0c045c348
```

Restart istio for the authorizer config to be picked up
```
kubectl rollout restart deployment/istiod -n istio-system
```

* Deploy the authorizer

We will use the downloaded package to deploy the authorizer

Unzip the package and the package includes various k8s resources that is required
to deploy the istio authorizer service onto the platform
** manifest.yaml
** kustomization.yaml
** parse-body.yaml

The default files will scan onlt the `default` namespace for services. In this case
our services are in a different namespace. So in our case we need to add the namespace
onto which our service is deployed (i.e `svc-apps-graph-ns`)

```
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      serviceAccountName: istio-authorizer
      containers:
        - image: docker.cloudentity.io/istio-authorizer:2.0.0-2
          imagePullPolicy: IfNotPresent
          name: istio-authorizer
          args:
          - --namespace
          - svc-apps-graph-ns
```

Let's apply the kustomization file to deploy all the resources to the `acp-system`
namespace

```
kubectl apply -k .
```

This will create a new `acp-system` namespace and deploy the authorizer under that namespace.
After this step we should see the services pop up in the Cloudentity ACP SaaS platform.

```
kubectl get pods -n acp-system
```

If you got API's => Gateway, if you see a green box , that means authorizer was able to talk
to the cluster. If it is grey, then there was a problem for the authorizer to communicate with
the ACP cluster due to networking/configuration issues.

Click on API's tab within the gateway and it should show all the auto discovered services, if it was
able to scan the annotations. In case, it is missing that means the annotation was not applied properly
or the schema specs are not readable.

* Prepare Istio mesh to protect using Cloudentity authorization policy

```
kubectl apply -f istio-configs/istio-mp-authorizer-policy.yaml
authorizationpolicy.security.istio.io/acp-authorizer created
```
### Enjoy some authorization

Let's play with some authorization scenarios to see the power of Cloudentity authorization platform

### Scenario#1: Block graphQL endpoint alltogether



* 

* Let's see the magic

There are multiple ways to enforce authorization, in this article we will be looking at a mechanism of decoupled,centralized and 




### Defining GraphQL schema

### Test endpoints

### Protecting endpoints

There are various ways of exposing these endpoints for external protection. Adhering to the OAuth standard specification, our recommendation would be use a dedicated policy enforcement points.

Let's add a piece of code that ensures that all the endpoints require some sort of authorization token
be present. Please note that in this approach, we will rely on upstream or attached process to verify the token and enforce the required policies. This approach is more flexible as it will allow your API system
to be exposed with different authorziation policies to multiple consumers without hardcoded assumption
or logic within the code about the authorization requirements






https://docs.mashery.com/connectorsguide/GUID-3812EE8B-3770-445C-83F2-FB6D1D54C18A.html

https://www.digitalocean.com/community/tutorials/api-authentication-with-json-web-tokensjwt-and-passport


istioctl proxy-config listeners istio-ingress-5bd77ffbdf-kbh9j -n svc-apps-graph-ns
ADDRESS PORT  MATCH DESTINATION
0.0.0.0 15021 ALL   Inline Route: /healthz/ready*
0.0.0.0 15090 ALL   Inline Route: /stats/prometheus*
> ~ $ istioctl proxy-config listeners svc-apps-graphql-tweet-service-graphql-nodejs-8457684f9f-sl9bw -n svc-apps-graph-ns
ADDRESS      PORT  MATCH                                                                                           DESTINATION
10.96.0.10   53    ALL                                                                                             Cluster: outbound|53||kube-dns.kube-system.svc.cluster.local
0.0.0.0      80    Trans: raw_buffer; App: HTTP                                                                    Route: 80
0.0.0.0      80    ALL                                                                                             PassthroughCluster
10.96.0.1    443   ALL                                                                                             Cluster: outbound|443||kubernetes.default.svc.cluster.local
10.96.111.24 443   ALL                                                                                             Cluster: outbound|443||istio-ingress.svc-apps-graph-ns.svc.cluster.local
10.96.26.222 443   ALL                                                                                             Cluster: outbound|443||istiod.istio-system.svc.cluster.local
0.0.0.0      5001  Trans: raw_buffer; App: HTTP                                                                    Route: 5001
0.0.0.0      5001  ALL                                                                                             PassthroughCluster
10.96.111.24 5001  Trans: raw_buffer; App: HTTP                                                                    Route: istio-ingress.svc-apps-graph-ns.svc.cluster.local:5001
10.96.111.24 5001  ALL                                                                                             Cluster: outbound|5001||istio-ingress.svc-apps-graph-ns.svc.cluster.local
10.96.0.10   9153  Trans: raw_buffer; App: HTTP                                                                    Route: kube-dns.kube-system.svc.cluster.local:9153
10.96.0.10   9153  ALL                                                                                             Cluster: outbound|9153||kube-dns.kube-system.svc.cluster.local
0.0.0.0      15001 ALL                                                                                             PassthroughCluster
0.0.0.0      15001 Addr: *:15001                                                                                   Non-HTTP/Non-TCP
0.0.0.0      15006 Addr: *:15006                                                                                   Non-HTTP/Non-TCP
0.0.0.0      15006 Trans: tls; Addr: ::0/0                                                                         InboundPassthroughClusterIpv6
0.0.0.0      15006 Trans: raw_buffer; Addr: ::0/0                                                                  InboundPassthroughClusterIpv6
0.0.0.0      15006 Trans: tls; App: TCP TLS; Addr: ::0/0                                                           InboundPassthroughClusterIpv6
0.0.0.0      15006 Trans: raw_buffer; App: HTTP; Addr: ::0/0                                                       InboundPassthroughClusterIpv6
0.0.0.0      15006 Trans: tls; App: istio-http/1.0,istio-http/1.1,istio-h2; Addr: ::0/0                            InboundPassthroughClusterIpv6
0.0.0.0      15006 Trans: tls; Addr: 0.0.0.0/0                                                                     InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: raw_buffer; Addr: 0.0.0.0/0                                                              InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: tls; App: TCP TLS; Addr: 0.0.0.0/0                                                       InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: raw_buffer; App: HTTP; Addr: 0.0.0.0/0                                                   InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: tls; App: istio-http/1.0,istio-http/1.1,istio-h2; Addr: 0.0.0.0/0                        InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: tls; App: istio,istio-peer-exchange,istio-http/1.0,istio-http/1.1,istio-h2; Addr: *:5001 Cluster: inbound|5001||
0.0.0.0      15006 Trans: raw_buffer; Addr: *:5001                                                                 Cluster: inbound|5001||
0.0.0.0      15010 Trans: raw_buffer; App: HTTP                                                                    Route: 15010
0.0.0.0      15010 ALL                                                                                             PassthroughCluster
10.96.26.222 15012 ALL                                                                                             Cluster: outbound|15012||istiod.istio-system.svc.cluster.local
0.0.0.0      15014 Trans: raw_buffer; App: HTTP                                                                    Route: 15014
0.0.0.0      15014 ALL                                                                                             PassthroughCluster
0.0.0.0      15021 ALL                                                                                             Inline Route: /healthz/ready*
10.96.111.24 15021 Trans: raw_buffer; App: HTTP                                                                    Route: istio-ingress.svc-apps-graph-ns.svc.cluster.local:15021
10.96.111.24 15021 ALL                                                                                             Cluster: outbound|15021||istio-ingress.svc-apps-graph-ns.svc.cluster.local
0.0.0.0      15090 ALL                                                                                             Inline Route: /stats/prometheus*
> ~ $

https://stackoverflow.com/questions/62620648/istio-and-the-http-host-header

https://codingbee.net/tutorials/kubernetes/services-nodeport

https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/#determining-the-ingress-ip-and-ports

https://stackoverflow.com/questions/59303619/how-do-i-install-istio-with-fixed-static-nodeport-assignments


> istio-authorizer-for-graphql $ kubectl logs -f istio-authorizer-77498bb44c-n4wkw -n acp-system
{"commit":"8765428","level":"info","msg":"Starting Istio authorizer","time":"2022-01-11T23:56:22Z","version":"2.0.0-2"}
{"level":"fatal","msg":"failed to run acp kubernetes synchronizer: [POST /gateways/configuration][422] setGatewayConfigurationUnprocessableEntity  \u0026{Details:map[GatewayAPIGroup.APIGroup.APIs[0].GatewayAPIGraphql.GraphQLSchema:GraphQL schema name must be valid: input:17: expected at least one definition, found )] Error:GraphQL schema name must be valid: input:17: expected at least one definition, found ) StatusCode:422}","time":"2022-01-11T23:56:23Z"}