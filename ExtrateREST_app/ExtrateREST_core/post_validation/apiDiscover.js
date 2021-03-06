const fs = require('fs');
var path = require('path');
const args = process.argv;
var isJSON = require('is-json');

// get open api file
var API_NAME, CompareSet_PATH;

if (args.length > 0) {
	API_NAME = args[2].split("//")[1].split("\.")[1];
	console.log(API_NAME)
	// google have several APIs
	if (API_NAME.includes("google")) {
		API_NAME = args[2].split("//")[1].split("/")[1];
	} else if (API_NAME.includes("/")) {
		if (!args[2].split("//")[1].startsWith("www") && !args[2].split("//")[1].startsWith("api") ) {
			API_NAME = args[2].split("//")[1].split("\.")[0];
		}
	}
	CompareSet_PATH = "../CompareSet/" + API_NAME;
}

const openAPI = require(CompareSet_PATH + "/OpenAPI.json");
var FinalSet_PATH = path.join(__dirname, "..", "/DiscoverSet/");
var API_PATH = path.join(FinalSet_PATH, API_NAME);

// 1. make sure it contains host && schema

let discoverAll = [];

if (openAPI.host && openAPI.schemes && openAPI.paths) {
	console.log("=========Validate host and schemes=============");
	// 2. delete path with begins with https

	var urlKeys = Object.keys(openAPI.paths);
	for (let i = 0; i < urlKeys.length; i++) {

		var url = urlKeys[i];

		var verbKeys = Object.keys(openAPI.paths[url]);

		for (let j = 0; j < verbKeys.length; j++) {
			var verb = verbKeys[j];
			console.log("========");
			console.log(url + "   " + verb);

			var verbObject = openAPI.paths[url][verb];
			console.log(verbObject);
			console.log("--------");
			var discover = {
				"request": {
					"ourl": null,
					"url": null,
					"method": null,
					"body": ""
				},
				"response": {
					"status": "200",
					"body": "",
					"ebody": ""
				}
			};

			discover.request['ourl'] = handleUrl(url);
			discover.request['method'] = verb;
			if (verbObject.hasOwnProperty('request')) {
				if (isJSON(verbObject.request)) {
					discover.request['body'] = JSON.stringify(JSON.parse(verbObject.request));
				} else {

					if (verbObject.request.startsWith("/")) {
						discover.request['url'] = openAPI.schemes + "://" + openAPI.host + basePath + verbObject.request
					} else {
						discover.request['url'] = verbObject.request;
					}

				}

			}

			if (verbObject.hasOwnProperty('responses')) {
				discover.response['ebody'] = JSON.stringify(verbObject.responses[200].example);
			}

			console.log(discover);
			discoverAll.push(discover);
		}

	}


	console.log("-----final----");
	console.log(discoverAll);
	if (!fs.existsSync(FinalSet_PATH)) {
		fs.mkdirSync(FinalSet_PATH);

	}

	if (!fs.existsSync(API_PATH)) {
		fs.mkdirSync(API_PATH);
	}

	fs.writeFileSync(API_PATH + "/discover.json", JSON.stringify(discoverAll, null, 2), 'utf8');
}

function handleUrl(url) {
	if (url.startsWith("/")) {
		return openAPI.schemes + "://" + openAPI.host + url
	} else if (url.startsWith("http")) {
		return url;
	}
	return url;
}