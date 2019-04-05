require('dotenv').config();

// get required dependencies
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

// get different routes required
const index = require('./routes/index');
const scraper = require('./routes/scrapeRoute');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// show the API dashboard
app.use('/', index);

const crawlRoute = express.Router();
crawlRoute.use('/', scraper);

app.use('/crawl', crawlRoute);

app.listen('8081');