const express = require('express');
const router = express.Router();

router.get('/scrape', (req, res) => {
  const itemName = req.body["url"];
  scrape(url)
      .then((emissions) => {
        
      })
      .catch((err) => {
        
      });
});

module.exports = router;