// get required dependencies
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const PORT = 8081;

// get different routes required
const index = require('./routes/index');
const scraper = require('./routes/scrapeRoute');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// show the API dashboard
app.use('/', index);

const scrapeRoute = express.Router();
scrapeRoute.use('/', scraper);

app.use('/', scrapeRoute);

app.listen(PORT);
console.log(`Listening on port ${PORT}`);

module.exports = app