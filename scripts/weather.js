const darkSky = require("../config/darksky");
const axios = require("axios");

function getCityWeather(city) {
	const coords = city["latitude"] + "," + city["longitude"];
	const dateTime = city["date"] + "T" + city["military_time"] + ":00";
	const q = coords + "," + dateTime;
	console.log("weather query:", q);
	return darkSky.get(q);
}

async function getWeather(cities, callback) {
	const weatherReqs = [];
	//assemble weather requests
	for (let city of cities) {
		weatherReqs.push(() => getCityWeather(city));
	}

	//trigger api calls concurrently
	console.log("sending weather requests...");
	const weatherResults = await axios.all(weatherReqs.map(func => func()));

	//add relevant weather results to cities
	console.log("adding weather data to cities...");
	for (let [index, res] of weatherResults.entries()) {
		cities[index]["temp"] = 
			(Math.round(parseFloat(res.data.currently.temperature) * 10) / 10
		).toString();
		cities[index]["summary"] = res.data.currently.summary;
		cities[index]["icon"] = res.data.currently.icon;
	}

	callback(cities);
}

module.exports = getWeather;
