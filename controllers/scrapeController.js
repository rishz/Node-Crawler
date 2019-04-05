const request = require('request-promise');
const cheerio = require('cheerio');

exports.scrape = url => {
	console.log(url);
	return new Promise((resolve, reject) => {
		request(url)
		    .then(html => {
		    	$ = cheerio.load(html);
			    links = $('a'); // jQuery get all hyperlinks
			    $(links).each(function(i, link){
			    	console.log($(link).text() + ':\n  ' + $(link).attr('href'));
			  	});
		        resolve();
		    })
		    .catch(err => {
		        reject(err);
		    });
	});
}