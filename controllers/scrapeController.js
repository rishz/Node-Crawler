const request = require('request-promise');
const cheerio = require('cheerio');
const baseLink = 'https://medium.com';
const Promise = require('bluebird');

const MAX_COUNT = 50;

let validateUrl = url => {
	if(url.startsWith(baseLink)) return true;
	return false;
}

let getLink = url => {
	let query = url.split("?");
	return query[0];
}

let getParams = url => {
	let query = url.split("?");
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

let makeRequest = url => {
	validUrls = [];
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
				    }
				});
				resolve(validUrls);
			})
			.catch(err => {
			    reject(err);
			});
	});
}
let count = 0;
let coverFirstLinks = urls => {
	return new Promise((resolve, reject) => {
		otherUrls = [];
		let allPromise = Promise.map(urls, makeRequest, {concurrency: 5});
		allPromise.then(allValues => {
		  	allValues.forEach(result => {
		  		result.forEach(url => {
		  			visitedUrls.push(url)
		  			otherUrls.push(url);
		  		});
		  	});
		  	console.log("OTHER ONES -> " + otherUrls);
		  	resolve(otherUrls);
		});
	});
}

let crawl = urls => {
	return new Promise((resolve, reject) => {
		coverFirstLinks(urls)
			.then(otherUrls => coverFirstLinks(otherUrls))
			.then(() => resolve(visitedUrls));
	});
}

let processUrls = urls => {
	console.log("LEN "+urls.length);
	return new Promise((resolve, reject) => {
		console.log(urls.length);
		let result = new Object();

		urls.forEach(url => {
			let val = getLink(url);
			let params = getParams(url);
			if(val in result){
				obj = result[val];
				obj.count++;
				params.forEach(param => {
					obj.params.add(param);
				});
			}else{
				obj = {};
				obj.count = 1;
				obj.params = params;
			}
			result[val] = obj;
		});
		console.log(result);
	});
}

exports.scrape = url => {
	return new Promise((resolve, reject) => {
		console.log(`Scraping ${url}`);
		crawl([url])
			.then(result => processUrls(result))
			.then(list => resolve(list));
	});
}