var express = require('express');
var app = express();

//graphql package import
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var loki = require('lokijs');
const {v4: uuidv4} = require('uuid');

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

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolverRoot,
    graphiql: true
}));

app.get('/', function(req, res) {
	res.send("We are building a tweet service!")
});

app.get('/health', function(req, res) {
	res.send('Service is alive and healthy')
});

app.listen(5001);
console.log("Server listening at http://localhost:5001/");