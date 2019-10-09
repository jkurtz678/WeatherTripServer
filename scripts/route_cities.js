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

const reverseGeocodePoints = async (points, callback) => {
	console.log("num points: " + points.length);
	const requests = [];
	let batch = [];
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		batch.push(() => reverseGeocode(points[i]));
		if ((i + 1) % 5 === 0) {
			requests.push(batch);
			batch = [];
		}
	}
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
		for( let i = 0; i < cities.length; i++) {
			cities[i]['latitude'] = points[i][0];
			cities[i]['longitude'] = points[i][1];
		}
		callback(cities);
	}, 2000);
};

function getRoutePoints(points, n) {
	
	const routePoints = [];
	for (let i = 0; i < points.length; i++) {
		if (i % Math.floor(points.length / (n-1)) === 0) {
			routePoints.push(points[i]);
		}
	}
	return routePoints;
}

//returns list of cities for a set number of route points
function getCitiesList(response, num_points, callback) {
	const points_list = response.data.routes[0].legs[0].points.map(pt =>
		Object.values(pt)
	);
	console.log("number of total points in route:",points_list.length);
	console.log(`Getting ${num_points} route points...`);
	const route_points = getRoutePoints(points_list, num_points);
	console.log('Performing reverse geocoding on points...');
	reverseGeocodePoints(route_points, callback);
}

module.exports = getCitiesList;