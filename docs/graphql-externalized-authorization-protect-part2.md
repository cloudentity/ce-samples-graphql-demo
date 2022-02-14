# Build and secure a GraphQL based application with Cloudentity authorization platform

This article is part 2 of our GraphQL application protection series. In this article, we will build a GraphQL API
server and protect its resources with externalized policies administered in the Cloudentity Authorization SaaS platform.
We will also protect the GraphQL API endpoint data with a local policy enforcement/decision point for the app deployed
within a local Kubernetes cluster. This approach will also showcase a
modern application protection hybrid model with local enforcement and Cloud based authorization and policy administration.

* Part 1: Externalized authorization for GraphQL using the Cloudentity authorization platform
* Part 2: Build a GraphQL server with Node.js and protect with the Cloudentity authorization platform
* Part 3. Build a GraphQL client react application to consume GraphQL server resources protected with the Cloudentity authorization platform

## Overview

We will build the GraphQL API server with `express-graphql` and `lokijs` as a built-in database.
Our application would be a tweet service that serves and consumes data exposed through APIs as
per GraphQL specification. Once we build the application, we will deploy it to a local
kubernetes cluster using `kind` and enforce centralized and decoupled policy based authorization without
modifying any business logic or code.

![Cloudentity authorization](acp-workload-protect-overview.jpeg)

You can checkout this entire [demo application and related integration source here](https://github.com/cloudentity/ce-samples-graphql-demo)

## Build the GraphQL server application

### Pre-requisites

Following tools are required to build this application. `nodejs` was picked for its simplicity to build apps.

- [nodejs](https://nodejs.org/en/) - Recommended v16.0 +
- [npm](https://docs.npmjs.com/getting-started) - Recommended v8.3.0 +

---
**SKIP/JUMP LEVEL**

> In case you are not interested in building the application from scratch, you can skip some of the steps below and instead checkout/clone the
> [github repo to get the application source code](https://github.com/cloudentity/ce-samples-graphql-demo)
> ```bash
> git clone git@github.com:cloudentity/ce-samples-graphql-demo.git
> ```
> and follow instructions to continue with the [Build and Deploy Section](#deploy-and-run-graphql-api-workload-in-kubernetes-cluster)
>
---

### Initialize a Node.js project

Initialize a Node.js project.

```bash
mkdir tweet-service-graphql-nodejs && cd tweet-service-graphql-nodejs
npm init
```

Click enter with no input for all prompts during npm init and finally type `yes` for the OK prompt. This will create
a `package.json` for the project that will eventually hold dependencies and other execution script commands.

Add a `start` command to scripts section in `package.json` to start the app quickly, e.g.:

```json
{
..
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  ..
}

```

We will use `express` npm module for http handling, so let's install the dependency as well.

```bash
npm install --save express
```

### Add http routers and listeners

Create a file named `index.js` and add basic router and listeners.


```js
var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.send("We are building a tweet service!")
});

app.get('/health', function(req, res) {
	res.send('Service is alive and healthy')
});

app.listen(5001);
console.log("Server listening at http://localhost:5001/");

```

### Run the app

```bash
npm start
```

This will start and serve the Node.js app listener, and the endpoints below should be serving traffic:

* [http://localhost:5001](http://localhost:5001)
* [http://localhost:5001/health](http://localhost:5001/health)


Now that we have the basic structure in place, let's continue to add some GraphQL specific features to the Node.js application.

### Add GraphQL capabilites

To add GraphQL API compliant endpoint within the Node.js server application, we will use the `express-graphql` npm package.
Let's install the dependencies and attach a listener endpoint for graphQL.

```bash
npm install --save graphql@15.3.0 express-graphql@0.12.0
```

**GraphQL SDL** allows defintion of the GraphQL schema using various constructs as
defined in the [GraphQL specification](https://spec.graphql.org/June2018/#sec-Schema). Let's build a schema that has a mixed
flavor of basic object types, fields, query and mutations.

In the schema, we will add a mix of GraphQL constructs and later in the article we will explore how to attach externalized authorization policies to each of these GraphQL constructs.

| GraphQL Construct | Examples |
| --- | ----------- |
| Object Type | TweetInput, Tweet |
| Field | content, author, id, dateModified, dateCreated .. |
| Query | sayHiTweety, getTweet, getLatestTweets .. |
| Mutation | createTweet, updateTweet, deleteTweet .. |

Add below schema specification to `index.js`

```js
// graphql package import
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

// graphql schema definition
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
    dateModified: String
		author: String
	}

	type Query {
		sayHiTweety: String
		getTweet(id: String!) : Tweet
		getLatestTweets : [Tweet]
	}

	type Mutation {
		createTweet(tweet: TweetInput): Tweet
		updateTweet(id: String!, tweet: TweetInput): Tweet
    deleteTweet(id: String!): String
	}`
);
```

* **Add implementation & listener for a GraphQL query**

Let's add a simple resolver implementation for the first query `sayHiTweety`. We will expand to other query and mutation implementations
later in the article. In contrast to REST, GrpahQL is designed to be a single endpoint API system. So all the queries and mutations will
be served over this single enpoint at `/graphql`. The url name can be anything, `graphql` is just used for convenience.

```js

var resolverRoot = {
	sayHiTweety: () => {
	return 'Hello Tweety';
    }
};

app.use('/graphql', graphqlHTTP(
{
	schema: schema,
	rootValue: resolverRoot,
	graphiql: true

}
));

```

* **Verify GraphQL API operations**

Start the application using `npm start` and launch the graphQL endpoint at [http://localhost:5001/graphql](http://localhost:5001/graphql).
Since the `graphiql` flag is set to true, we will see an interactive query screen and schema explorer as response.

---
**NOTE**

We will not be using above interface but usage of [Postman](https://www.postman.com/downloads/) app for further verification of GraphQL APIs
is recommended.

---

[Download Postman](https://www.postman.com/downloads/) app, in case you don't have it already, and then [import](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman) the [Cloudentity GraphQL tweet service demo postman collection](https://www.getpostman.com/collections/b84dcc2e6d7034c02d48) onto Postman.


* **Execute GraphQL `sayHiTweety` query**

Navigate to the [imported postman collection](https://www.getpostman.com/collections/b84dcc2e6d7034c02d48) under `request-noauth` folder and run the `sayHiTweety-Query` GraphQL API request.
It should respond with the response attached below.

![Graphql-api-response](graphql-query-response.png)

### Expand GraphQL implementation logic

Let's add a simple in-memory datastore to store the tweets and then add some mutations and queries to act on those objects.
We will not dive into the specifics or add any complex business logic. Our main goal is to showcase **externalized
authorization policy administration and enforcement** for the various **GraphQL objects, fields, queries and mutations etc at runtime**.

* Install dependencies

```bash
npm install --save uuid lokijs
```

* Add implementation for GraphQL query and mutation

```js
//imports
var loki = require('lokijs');
const {v4: uuidv4} = require('uuid');

//logic
var db = new loki('tweets.db');
var tweets = db.addCollection('tweets');

const getTweet = (tid) => {
	console.log("Fetching record..");
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
	sayHiTweety: () => {
	    return 'Hello Tweety';
    },
    getTweet: (tid) =>  {
		console.log("Fetching tweet using id: " + Object.values(tid));
		return getTweet(tid);
	},
	createTweet: (input) =>  {
		console.log("Creating a new tweet...");
		const newTweet = new Tweet(input);
		storeTweet(newTweet);
		return newTweet;
	},
	getLatestTweets: () => {
		console.log("Fetching records..");
		var tweets = db.getCollection('tweets');
		var all = tweets.find({ 'id': { '$ne': null } });
		return all;
	},
	deleteTweet: (tid) => {
		console.log("Deleting tweet..");
		var tweets = db.getCollection('tweets');
		tweets.findAndRemove({id: tid.id});
		return tid.id;
	},
};

```

* **Verify all GraphQL API operations**

Navigate to the imported collection in Postman and run rest of the GraphQL endpoints. These
should now return responses similar to below attached samples. At this point the GraphQL API application is **completely unprotected** and data can be requested or posted without authorization.

![Graphql-api-responses](graphql-sample-responses.jpeg)


### Deploy and Run GraphQL API workload in Kubernetes cluster

Let's deploy the GraphQL API onto a local Kubernetes cluster to enforce **externalized
authorization policies with the Cloudentity authorization platform** without any modification to the application code.

---
**NOTE**

> We will be referencing `make` commands in below sections. There is a [`Makefile`](https://github.com/cloudentity/ce-samples-graphql-demo/blob/master/tweet-service-graphql-nodejs/Makefile) in the project folder and
> the contents can be inspected for the actual commands that are orchestrated by the `make` target

---

### Pre-requisites

Local Kubernetes cluster
can be deployed using any tool of your choice, but we will use `kind` in this article.

* [docker](https://docs.docker.com/get-docker/)
* [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
* [helm](https://helm.sh/docs/helm/helm_install/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/)

---
**SKIP/JUMP LEVEL**

> In case you want to skip some of the deployment detailed steps and want to move to next logical step with a shortcut, use
>```bash
> make all
> ```
>
> This will deploy all resources and you can jump to the [Protect using Cloudentity authorization platform](#authorization-policy-administration-in-cloudentity-authorization-platform)

---

### Build the docker image

First get a copy of the `Makefile` and `Dockerfile`

```bash
wget https://raw.githubusercontent.com/cloudentity/ce-samples-graphql-demo/blob/master/tweet-service-graphql-nodejs/Makefile
wget https://raw.githubusercontent.com/ce-samples-graphql-demo/blob/master/tweet-service-graphql-nodejs/Dockerfile
```

Now let's build the docker image for GraphQL API using 

```bash
make build-image
```

### Launch the Kubernetes cluster

We will go ahead and create a Kubernetes cluster using `kind`. The below cluster config will be used to
create the cluster and within the config, a `NodePort` is configured to enable accessibility
at port `5001` from outside of the cluster since we do not have an actual load balancer.

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 31234
    hostPort: 5001
    protocol: TCP
```

Get a copy of `k8s-cluster-config.yaml`

```bash
wget https://raw.githubusercontent.com/cloudentity/ce-samples-graphql-demo/master/tweet-service-graphql-nodejs/k8s-cluster-config.yaml
```

Create the kind cluster using:

```bash
make deploy-cluster
```

### Deploy GraphQL app on the Kubernetes cluster

We will use `helm` to define and deploy all the Kubernetes resources required for the application. We will not be going into the helm details, so copy the existing helm templates into our working directory from https://github.com/cloudentity/ce-samples-graphql-demo/tree/master/tweet-service-graphql-nodejs/helm-chart

Using the below `make` command, we will upload the image to kind cluster, create a Kubernetes namespace and deploy the GraphQL app.

```bash
make deploy-app-graph-ns
```

The above make target will launch all the pods and services to run the GraphQL app. The status of the pods and services can be fetched using:

```bash
kubectl get pods -n svc-apps-graph-ns

kubectl get services -n svc-apps-graph-ns
```

### Service readiness

Let's exec into the pod container to see if the service is reachable (note the ID appended to the name of the pod after running `kubectl get pods -n svc-apps-graph-ns` and replace it in the command below)

```bash
kubectl exec -it <pod-name> -n svc-apps-graph-ns -- /bin/sh
```

and run

```bash
curl --location --request POST 'http://local.cloudentity.com:5001/graphql' \
--header 'Content-Type: application/json' \
--data-raw '{"query":"query {\n    sayHiTweety\n}\n","variables":{}}'
```

```json
{
    "data": {
        "sayHiTweety": "Hello Tweety"
    }
}
```
---
**NETWORK ACCESS**

The components deployed on the Kubernetes cluster are not exposed outside the Kubernetes cluster. External access to individual services can be provided by creating an external load balancer or node port on each service. An Ingress Gateway resource can be created to allow external requests through the Istio Ingress Gateway to the backing services.

---

### Deploy Istio

To allow external service access, let's install `Istio` onto this cluster. We will use the [`helm` based install mechanism for installing `istio`](https://istio.io/latest/docs/setup/install/helm/)
We have condensed all required steps under the `make` target, which updates the helm repo and installs `istiod` under `istio-system` namespace.

```bash
make deploy-istio
```

Check the status of the pods: 

```bash
kubectl get pods -n istio-system
```

and once the pod is healthy, let's add an Istio Ingress Gateway to expose the traffic outside the cluster.

### Expose the Service externally with Istio Ingress Gateway

Let's install the `Istio Ingress Gateway` and configure a `Virtual Service` for routing to the GraphQL service in the `svc-apps-graph-ns` namespace.
Let's first copy some configs that will be used for the below steps from the gitub repo:

```bash
mkdir istio-configs
wget -P istio-configs https://raw.githubusercontent.com/cloudentity/ce-samples-graphql-demo/master/tweet-service-graphql-nodejs/istio-configs/istio-helm-config-override.yaml
wget -P istio-configs https://raw.githubusercontent.com/cloudentity/ce-samples-graphql-demo/master/tweet-service-graphql-nodejs/istio-configs/istio-ingress-gateway-graphql.yaml
wget -P istio-configs https://raw.githubusercontent.com/cloudentity/ce-samples-graphql-demo/master/tweet-service-graphql-nodejs/istio-configs/istio-ingress-virtual-service.yaml
wget -P istio-configs https://raw.githubusercontent.com/cloudentity/ce-samples-graphql-demo/master/tweet-service-graphql-nodejs/istio-configs/istio-mp-authorizer-policy.yaml

```

 using:

```bash
make deploy-istio-gateway
```

You can confirm if the gateway and virtual service is created and running using

```bash
kubectl get gateways -A
kubectl get virtualservices -A
```

Now, let's check to see if we can access the service from outside the cluster

```bash
curl --location --request POST 'http://localhost:5001/graphql' \
--header 'Host: local.cloudentity.com' --header 'Content-Type: application/json' \
--data-raw '{"query":"query {\n    sayHiTweety\n}\n","variables":{}}'
```

OR

```bash
curl --location --request POST 'http://local.cloudentity.com:5001/graphql' \
--header 'Content-Type: application/json' \
--data-raw '{"query":"query {\n    sayHiTweety\n}\n","variables":{}}'
```

Notice that the either the `Host` header needs to be passed in or the domain
needs to have a matching name of `local.cloudentity.com` as it's defined in the `iStio Virtual
Service` routing rule.

Expected output.

```json
{
    "data": {
        "sayHiTweety": "Hello Tweety"
    }
}
```

Voila! Now the services should be accessible from outside the cluster. Now that we have a production-like Kubernetes deployment serving GraphQL operations from the platform, let's dive into protecting the application using **externalized authorization policies using the Cloudentity platform** without altering the application code at all.

## Authorization Policy administration in Cloudentity authorization platform

* Sign up for a [free Cloudentity Authorization SaaS account](https://authz.cloudentity.io/register)
* Activate the tenant and take the self guided tour to familiarize with the platform

Now that you have the Cloudentity platform available, let's connect all the pieces together
as shown below

![Cloudentity istio authorizer](authorizer-concept-overview.jpeg)

### Annotate services for service auto discovery

Cloudentity micropermeter authorizers can self discover API endpoints if annotated properly in a Kubernetes cluster. More details on discovery is detailed in [auto discovery of services on Istio](https://docs.authorization.cloudentity.com/guides/developer/protect/istio/graphql/#graphql-api-discovery).

For example, [in the helm chart](https://github.com/cloudentity/ce-samples-graphql-demo/blob/master/tweet-service-graphql-nodejs/helm-chart/tweet-service-graphql-nodejs/templates/deployment.yaml#L8), we have annotated the services so that final deployment resource file has the annotations. `services.k8s.cloudentity.com/spec-url` annotation enables this GraphQL schema to be read by
Cloudentity Istio authorizers deployed onto a cluster and then propagated to the Cloudentity Authorization Plaform can then govern and
attach declarative policies on the GraphQL schema itself.

---
**NOTE**

The GraphQL schema URL can be served by the GraphQL API resource server itself or hosted in separate accessible location. We are using
an external URL only for demonstration purpose.

---


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "tweet-service-graphql-nodejs.fullname" . }}
  labels:
    {{- include "tweet-service-graphql-nodejs.labels" . | nindent 4 }}
  annotations:
    services.k8s.cloudentity.com/spec-url: "https://raw.githubusercontent.com/cloudentity/random-bin/master/graphql/tweet-svc-schema"
    services.k8s.cloudentity.com/graphql-path: "/graphql"
```


In case you want to change the annotation, you can [update the url in the helm template](https://github.com/cloudentity/ce-samples-graphql-demo/blob/master/tweet-service-graphql-nodejs/helm-chart/tweet-service-graphql-nodejs/templates/deployment.yaml#L8) and do the following

```bash
helm uninstall svc-apps-graphql -n svc-apps-graph-ns
helm install svc-apps-graphql helm-chart/tweet-service-graphql-nodejs -n svc-apps-graph-ns
```

### Deploy Cloudentity Istio authorizer to the Kubernetes cluster

In this step, we will install and configure the Cloudentity Istio authorizer to act as the Policy Decision Point(PDP). The scope of responsibility of this component is to act as the local policy decision point within the Kubernetes cluster. This component is also responsible to pull down all the applicable authorization policies authored and managed within the Cloudentity authorization platform. In the below image, the highlighted section in the box is the component that we will download and install onto a local Kubernetes cluster.

![Cloudentity istio authorizer](mp-authorizer-highlight.jpeg)

[Detailed Istio setup concepts and instruction are available here,](https://docs.authorization.cloudentity.com/guides/developer/protect/istio/) in a nutshell the steps are:
* Navigate to the Cloudentity authorization platform admin console
* Go to `Enforcement >> Authorizers` and Create a new Istio authorizer. Click on "Bind services automatically". Technically, this means we will register this discovered service as an `OAuth resource server` within
the Cloudentity platform. 
* Install the `istio-authorizer` in target Kubernetes using the `Helm` commands provided in installation instructions Step 1.

---
**NOTE**

Cloudentity Istio authorizer will be deployed to its own name space (in this case `acp-istio-authorizer`). The authorizers can be deployed to any namespace
based on the deployment architecture. The namespaces chosen in this article are for demonstration purpose only.

---

What happens with the given helm command?
* The above command will create a new `acp-istio-authorizer` namespace
* deploy the `istio-authorizer` under that namespace
* Configures the target namespaces the authorizer should scan for service discovery and traffic enforcement
* Creates a [request body parser Envoy filter resource](https://github.com/cloudentity/acp-helm-charts/blob/master/charts/istio-authorizer/templates/envoyfilter.yaml) for the service pod in the target namespaces (if configured)
* Creates the [Cloudentity authorization policy resource](https://github.com/cloudentity/acp-helm-charts/blob/master/charts/istio-authorizer/templates/policy.yaml)  as an [Istio external authorization policy](https://istio.io/latest/docs/concepts/security/#implicit-enablement).  External authorization policies are "CUSTOM" actions and will be evaluated first in the Istio authorization policy authorizer.

![Cloudentity istio authorizer authorization](k8s-component-namespaces.jpeg)

You can modify the command to include an override in the values file
```
parseBody:
  enabled: true
```

```
helm upgrade --install istio-authorizer acp/istio-authorizer \
  -f overide-values.yaml
  ..
  ..
```


> NOTE
> If you don't apply the above request parser sidecar, you will get this error
>
> ```json
> {
    "errors": [
        {
            "message": "failed to parse json: unexpected end of JSON input"
        }
    ]
}
>```

Step 2 , attach external authorization to Istio

Cloudentity Istio authorizer is designed to be a native Istio extension that uses [Istio External authorizer](https://istio.io/latest/docs/tasks/security/authorization/authz-custom/) model.Add `extensionProviders` under `mesh` section to indicate that `acp-authorizer` will be an external authz provider.


```bash
kubectl get pods -n acp-istio-authorizer
```

![Cloudentity istio authorizer authorization](healthy-istio-authorizer.png)

---
**IMPORTANT**

We have seen issues with this step if there is network traffic restrictions between the local workstations and the external Cloudentity platform due to internal firewalls, etc.
Make sure the traffic path is allowed in case you see the pod status as not healthy.

---

#### Restart the service pods

Since we are using automatic Istio injection, we need to recreate the pod so that `envoy-proxy` is injected into the service namespaces

```
kubectl rollout restart deployment/svc-apps-graphql-tweet-service-graphql-nodejs -n svc-apps-graph-ns
```

After this step we should see the APIs auto discovered by the Cloudentity authorizer and propagated back up to the the Cloudentity Authorization SaaS platform. Let's check it out in the Cloudentity authorization platform.


### **Cloudentity authorizer and Cloudentity platform communication**

It is very important that the communication path between the local Istio authorizer and Cloudentity Authorization SaaS platform is established. The local Istio authorizer is
responsible for pushing any discovered services to platform for further governance. Once pushed, the centralized policies administered and managed in the platform
are polled back by the authorizer for policy decisions and enforcement locally.

![Cloudentity istio authorizer authorization](mp-authorizer-highlight.jpeg)


#### Service Communication

Login into the Cloudentity authorization admin portal and navigate to the `Enforcement >> Authorizers`. As shown in the below diagram, the `Last Active` column is an indication of communication status of the local authorizer with the remote platform.

![Cloudentity istio authorizer authorization](succesful-istio-connection.png)

Regarding the communication security, the local Istio authorizer uses `OAuth` authorization mechanisms to authenticate itself to the Cloudentity authorization SaaS platform before handshaking information.

#### Discovered service from cluster

If the business service(workload) is discovered from the remote Kubernets cluster, it should automatically be bound in the ACP platform. Technically, this means
 Cloudentity authorization platform will register this discovered service as an `OAuth resource server` and can be governed from within the platform).

![Cloudentity istio authorizer authorization](bind-the-service.png)

#### Govern GraphQL API and Schema**

At this point, the remote workload should be available to govern within the Cloudentity authorization platform. In case of GraphQL workload, the schema annotated along with the workload
is also transferred  by the local Cloudentity authorizer to the Cloudentity authorization platform. This enables us to explore the GraphQL schema for the workload and we can apply authorization policies and manage the policies applied to the various constructs within the GraphQL schema.

![Cloudentity istio authorizer authorization](graphql-endpoint-mgmt.png)

![Cloudentity istio authorizer authorization](graphql-schema-discovered.png)


Now we have seen the service is available in the Cloudentity authorization platform for governance and central management of authorization policies, which will automatically be
downloaded by respective local satelite Cloudentity authorizers bound to the services. This way the Cloudentity authorization platform acts as a very powerful and robust policy management services engine and the Cloudentity authorizers acts as policy runtime services that makes decisions using the policies governed and administered within the central policy management engine.


## Enforce externalized dynamic authorization

Before we start enforcing policies, run the postman collection(https://www.getpostman.com/collections/b84dcc2e6d7034c02d48)
to check if all the GraphQL API operations are still accessible. Once the pre check is complete, let's try to add more authorization scenarios to enforce access and
authorization policies authored and managed via the Cloudentity authorization platform.

For policy governance, we expect the admin (policy administrator) to
* Login into the Cloudentity Authorization portal
* Navigate to the workspace and select `Enforcement >> APIs` nav item to see the GraphQL APIs
* Apply policies at various GraphQL construct level in the GraphQL API explorer

### Scenario#1: Block GraphQL endpoint alltogether

Let's say we want to temporarily block access to all users for this endpoint. For this
* Select the GraphQL API endpoint and attach  a `Block API` policy.

This in effect blocks any call made to any GraphQL operation. Run any of the test
in the [imported Postman Test collection](https://www.getpostman.com/collections/b84dcc2e6d7034c02d48)
and we should see an "authorization denied" response.


| Authorization policy | Output |
| --- | ----------- |
| ![alt-text-1](unprotected-graphql-endpoint.png "title-1") |  ![alt-text-2](graphql-output-no-protection.png "title-2") |
| ![alt-text-1](protected-graphql-endpoint.png "title-1") | ![alt-text-2](graphql-api-protected.png "title-2") |


### Scenario#2: Disallow GraphQL queries for specific fields

Let's say we do not want GraphQL clients to ask for a specific field that is available in the schema. These could be internal
 identifiers or only could be requested by some special priviliged internal applications. For this
* Select the GraphQL API endpoint and enter into the `GraphQL API explorer`
* Navigate to `Objects` and go to the `Tweet` field
* Assign the `Block API` policy to `dateModified` completely

This in effect blocks any `GraphQL query` that requests for the `dateModified` field. Let's run the `getLatestTweets`
query from the [imported Postman Test collection](https://www.getpostman.com/collections/b84dcc2e6d7034c02d48).

Modify the request payload to include/exclude `dateModified` in the query and observe the response difference.
Whenever `dateModified` is requested, the request is automatically rejected.

| Authorization policy | Output |
| --- | ----------- |
| ![alt-text-1](date-modified-enforce.png "title-1") |  ![alt-text-2](api-field-date-modified-absent.png "title-2") |
| ![alt-text-1](date-modified-enforce.png "title-1") | ![alt-text-2](api-field-date-modified-present.png "title-2") |


### Scenario#3: Disallow GraphQL queries for specific objects with constraints

Let's say we do not want GraphQL clients to ask for a specific object unless some specific constraints are met for that
client application. For example, we want to return the `Tweet` object only when some `constraint` is met.
In this  we can apply a policy at the object level
for IP address check that is available in the given range. For this we will use the inbuilt `Rego` engine to author
the policy.

For this:
* Select the GraphQL API endpoint and enter into the `GraphQL API explorer`
* Navigate to `Objects`
* Select the `Tweet` object and apply the constrained `IP check` policy at object level.

`Sample Rego policy`
```yaml
package acp.authz

default allow = false

allowedCidrRange :=   
    [
    "3.0.0.0/9",
    "3.128.0.0/10",
    "4.0.0.0/8",
    "5.8.63.0/32",
    "5.10.64.160/29",
    "217.161.27.0/25"
    ]

extracted_ip := input.request.headers["X-Custom-User-IP"][_]   


is_within_allowed_cidr = true {
    some i
    net.cidr_contains(allowedCidrRange[i], extracted_ip)
} else = false

allow {
  is_within_allowed_cidr
}

```

| Authorization policy | Output |
| --- | ----------- |
| ![alt-text-1](graphql-object-protect.png "title-1") |  ![alt-text-2](api-object-response.png "title-2") |


### Scenario#4: Block GraphQL delete mutation unless it comes from a client with specific metadata

Let's say we do not want all GraphQL clients to operate on `deleteTweet` mutation.
For example, we want to allow only access tokens issued to specific clients to be authorized to use the
`deleteTweet` mutation. This way this operation can be used by specific clients and not all client apps even
though it is available in schema.

For this:
* Select the GraphQL API endpoint and enter into the `GraphQL API explorer`
* Navigate to `Mutation`
* Select the `deleteTweet` Mutation operation and apply the constrained `allow-only-for-specific-clients` policy at mutation level.


| Authorization policy | Output |
| --- | ----------- |
| ![alt-text-1](allow-specific-clients.png "title-1") |  ![alt-text-2](graphql-output-no-protection.png "title-2") |


### Scenario#5: Allow GraphQL query only if token is issued by a specific Authorization server

Let's say we do not want all GraphQL clients to operate on `getTweets` query.

For example, we want to allow only access tokens issued by specific authorization servers to be authorized to use the

`getTweets` query.

![alt-text-1](issuer-check-policy.png)

| Authorization policy | Output |
| --- | ----------- |
| ![alt-text-1](graphql-query-enforce.png "title-1") |  ![alt-text-2](graphql-output-no-protection.png "title-2") |


## Next steps

Now that we have protected a GraphQL API resource server with dynamic and flexible authorization policies, we will build
a simple GraphQL client application to demonstrate an entire application in real life. In this client application, we will
look at how to get an access token from the Cloudentity authorization server and then utilize it to make further calls
to the GraphQL API resource server.