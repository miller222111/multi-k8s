const keys = require('./keys');

// --------------Express App Setup-------------- //
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// New Express App (receive and respond to any http request)
const app = express();

// Cross-Origin Resource Sharing (cors) will allow us to make
// requests from one domain, that react app will be running in,
// to a different port that the express API is hosted on.
app.use(cors());

// Parses incoming request from the React App and turns the
// body of the "post" request into a json value that the
// express API can very easily work with.
app.use(bodyParser.json());

// --------------Postgres Client Setup-------------- //
const{ Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
    // SSL was needed for AWS deployment
    ssl:
        process.env.NODE_ENV !== 'production'
            ? false
            : { rejectUnauthorized: false },
});

pgClient.on("connect", (client) => {
    // Index Housing Table
    client
        .query('CREATE TABLE IF NOT EXISTS values (number INT)')
        .catch( (err) => console.log(err));
});

// --------------Redis Client Setup-------------- //
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// --------------Express Route Handlers-------------- //
app.get('/', (req, res) => {
    res.send('Hi');
});

// Return all indices that have ever been submitted to Postgres
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows);
});

// Return previously calculated values for indices
app.get('/values/current', async (req, res) => {
   redisClient.hgetall('values', (err, values) => {
    res.send(values);
   });
});

// React App to Express server route handler
app.post('/values', async (req, res) => {
    const index = req.body.index;

    // If index > 40 then respond with below
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    // If have not yet calculated value for particular index
    redisClient.hset('values', index, 'Nothing yet!');

    // Redis request to "worker server" to calculate a new value
    redisPublisher.publish('insert', index);

    // Insert index into Postgres
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    // Message to inform that work is being done to calculate value
    res.send({ working: true});
});

app.listen(5000, (err) => {
    console.log('Listening');
});