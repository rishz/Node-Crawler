// Getting the dependencies
const request = require('request-promise');
const cheerio = require('cheerio');
const baseLink = 'https://medium.com';
const Promise = require('bluebird');
const URL = require('../database/schema/URLSchema');
const mongoose = require("mongoose");
const fs = require('fs');

// Configuring mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/nodecrawler");

// When successfully connected
mongoose.connection.on('connected', () => {
  console.log('Connection to database established successfully');
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log(`Error connecting to database: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Database disconnected');
});

// validate the url
let validateUrl = url => {
	if(url.startsWith(baseLink)) return true;
	return false;
}

// extract the link
let getLink = url => {
	let query = url.split("?");
	return query[0];
}

// extract the params
let getParams = url => {
	let query = url.split("?");
	if(!query[1]) return new Set();
    let vars = query[1].split("&");
    let params = new Set();
    for (let i=0;i<vars.length;i++) {
        let pair = vars[i].split("=");
        if(pair[0]) params.add(pair[0]);
    }
    return (params);
}

let visitedUrls = [];

// function for making request
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
// function to cover all the links on home page and recurse
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
		  	resolve(otherUrls);
		});
	});
}

// crawls the urls
let crawl = urls => {
	return new Promise((resolve, reject) => {
		coverFirstLinks(urls)
			.then(otherUrls => coverFirstLinks(otherUrls))
			.then(() => resolve(visitedUrls));
	});
}

// processes the urls and returns Object Array
let processUrls = urls => {
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

		let objArray = [];
		for(let key in result){
			obj = {};
			obj.url = key;
			obj.count = result[key].count;
			params = [];
			result[key].params.forEach(param => {
				params.push(param);
			})
			obj.params = params;
			objArray.push(obj);
		}
		resolve(objArray);
		console.log("len = "+objArray.length);
	});
}

// saves urls to Mongo db
let saveUrls = urls => {
	console.log("SAVE TO DB "+urls.length);
	return new Promise((resolve, reject) => {
		URL.create(urls,  err => {
		  if (err) reject(err);
		  resolve();
		});
	});
}

// saves urls to file
let saveToFile = () => {
	return new Promise((resolve, reject) => {
		URL.find({}, (err, urls) => {
			console.log(urls.length);
			let data = [];
			urls.forEach(record => {
				obj = {};
				obj.url = record.url;
				obj.count = record.count;
				obj.params = record.params;
				data.push(JSON.stringify(obj));
				data.push('\n');
			});
		    fs.writeFile("output.txt", data, err => {
				if(err) {
				    reject(err);
				}
				console.log('Saved!');
				resolve();
			}); 
		});
	});
}

exports.scrape = url => {
	return new Promise((resolve, reject) => {
		console.log(`Scraping ${url}`);
		crawl([url])
			.then(result => processUrls(result))
			.then(list => saveUrls(list))
			.then(() => saveToFile())
			.then(() => {
				mongoose.connection.close();
				resolve();
			})
			.catch(err => console.log(err));
	});
}