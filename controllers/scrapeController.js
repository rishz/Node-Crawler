const request = require('request-promise');
const cheerio = require('cheerio');
const baseLink = 'https://medium.com';
const Promise = require('bluebird');

const MAX_COUNT = 1000;

let validateUrl = url => {
	if(url.startsWith(baseLink)) return true;
	return false;
}

let getParams = url => {
	let query = url.split("?");
	console.log(query);
	if(!query[1]) return [];
    let vars = query[1].split("&");
    let params = new Set();
    for (let i=0;i<vars.length;i++) {
        let pair = vars[i].split("=");
        if(pair[0]) params.add(pair[0]);
    }
    return (params);
}

let visitedUrls = [];
let count = 0;

let makeRequest = url => {
	validUrls = [];
	// console.log("url = "+url+" "+count);
	return new Promise((resolve, reject) => {
		request(url)
			.then(html => {
			    $ = cheerio.load(html);
				links = $('a'); // jQuery to get all hyperlinks
				$(links).each((i, link) => {
				    let url = $(link).attr('href');
				    if(validateUrl(url)){
				    	console.log(url);
				    	validUrls.push(url);
				    	count++;
				    }
				});
				resolve(validUrls);
			})
			.catch(err => {
			    reject(err);
			});
	});
}

let crawl = urls => {
	if(count < MAX_COUNT){
		const allPromise = Promise.map(urls, makeRequest, {concurrency: 5});
		allPromise.then(allValues => {
		  	allValues.forEach(result => {
		  		result.forEach(url => visitedUrls.push(url));
		  		crawl(result);
		  	});
		});
	}else{
		return visitedUrls;
	}
}


exports.scrape = url => {
	console.log(`Scraping ${url}`);
	linksToVisit.push(url);
	const result = crawl([url]);
	console.log(result.length);
}