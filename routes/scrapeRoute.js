const express = require('express');
const router = express.Router();

// Getting the scraper controller
const { scrape } = require('../controllers/scrapeController');

router.get('/scrape', (req, res) => {
  const url = req.body["url"] || 'http://www.medium.com/';
  console.log(url);
  scrape(url)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
});

module.exports = router;