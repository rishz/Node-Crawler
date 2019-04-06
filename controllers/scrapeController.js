const request = require('request-promise');
const cheerio = require('cheerio');

exports.scrape = url => {
	return new Promise((resolve, reject) => {
		request(url)
		    .then(html => {
		    	$ = cheerio.load(html);
			    links = $('a'); // jQuery to get all hyperlinks
			    let urls = {};

			    $(links).each(function(i, link){
			    	console.log($(link).text() + ':\n  ' + $(link).attr('href'));
			    	let url = $(link).attr('href');
			    	if(url in urls){
			    		urls[url] += 1;
			    	}else{
			    		urls[url] = 1;
			    	}
			  	});

		        resolve(urls);
		    })
		    .catch(err => {
		        reject(err);
		    });
	});
}