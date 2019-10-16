const tomtom = require("../config/tomtom");
const keys = require("../config/keys");
const axios = require("axios");

const reverseGeocode = point => {
	const loc_string = point[0] + "," + point[1];
	return tomtom.get("/search/2/reverseGeocode/" + loc_string + ".json", {
		params: {
			key: keys.tomtomApiKey
		}
	});
};

//sends 5 requests each second
const staggeredRequests = (batches, callback) => {
	let results = [];
	for (let [index, batch] of batches.entries()) {
		setTimeout(async () => {
			console.log("Sending request batch number: ", index);
			results = results.concat(
				await axios.all(batch.map(func => func()))
			);
			if (index === batches.length - 1) {
				callback(results);
			}
		}, index * 1100);
	}
};

const reverseGeocodePoints = async (points, callback) => {
	//place points into sets of 4
	const requests = [];
	let batch = [];
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		batch.push(() => reverseGeocode(points[i]));
		if ((i + 1) % 4 === 0) {
			requests.push(batch);
			batch = [];
		}
	}

	staggeredRequests(requests, function(results) {
		//console.log("results from staggeredRequests:", results);
		//make new object with just city and state names
		const cities = results.map(res => {
			const cityObj = {};
			const res_json = res.data.addresses[0].address;
			cityObj["city"] = res_json.countryTertiarySubdivision;
			cityObj["state"] = res_json.countrySubdivision;
			return cityObj;
		});
		//add lat and long to cities object
		for (let i = 0; i < cities.length; i++) {
			cities[i]["latitude"] = points[i][0];
			cities[i]["longitude"] = points[i][1];
		}
		callback(cities);
	});
	/*
	const results = await axios.all(requests[0].map(func => func()));

	let results2 = [];
	setTimeout(async () => {
		results2 = await axios.all(requests[1].map(func => func()));
	}, 1000);
	let results3 = [];
	setTimeout(async () => {
		results3 = await axios.all(requests[2].map(func => func()));
		const joined_results = results.concat(results2, results3);

		//make new object with just city and state names
		const cities = joined_results.map(res => {
			const cityObj = {};
			const res_json = res.data.addresses[0].address;
			cityObj["city"] = res_json.countryTertiarySubdivision;
			cityObj["state"] = res_json.countrySubdivision;
			return cityObj;
		});
		//add lat and long to cities object
		for (let i = 0; i < cities.length; i++) {
			cities[i]["latitude"] = points[i][0];
			cities[i]["longitude"] = points[i][1];
		}
		callback(cities);
	}, 2000);*/
};

/**
 * Retrieve a fixed number of elements from an array, evenly distributed but
 * always including the first and last elements.
 *
 * @param   {Array} items - The array to operate on.
 * @param   {number} n - The number of elements to extract.
 * @returns {Array}
 */
function getRoutePoints(items, n) {
	var elements = [items[0]];
	var totalItems = items.length - 2;
	var interval = Math.floor(totalItems / (n - 2));
	for (var i = 1; i < n - 1; i++) {
		elements.push(items[i * interval]);
		console.log("getting item at index:", i * interval);
	}
	elements.push(items[items.length - 1]);
	return elements;
}

//returns list of cities for a set number of route points
function getCitiesList(response, num_points, callback) {
	const points_list = response.data.routes[0].legs[0].points.map(pt =>
		Object.values(pt)
	);
	console.log("number of total points in route:", points_list.length);
	console.log(`Getting ${num_points} route points...`);
	const route_points = getRoutePoints(points_list, num_points);
	console.log(
		`Performing reverse geocoding on ${route_points.length} points...`
	);
	reverseGeocodePoints(route_points, callback);
}

module.exports = getCitiesList;
