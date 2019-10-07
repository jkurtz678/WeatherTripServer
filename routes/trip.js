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

const reverseGeocodePoints = async points => {
	console.log("num points: " + points.length);
	const requests = [];
	let batch = [];
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		batch.push(() => this.reverseGeocode(points[i]));
		if ((i + 1) % 5 === 0) {
			requests.push(batch);
			batch = [];
		}
	}
	console.log(requests);
	const results = await axios.all(requests[0].map(func => func()));
	console.log(results);

	let results2 = [];
	setTimeout(async () => {
		results2 = await axios.all(requests[1].map(func => func()));
		console.log(results2);
	}, 1000);
	let results3 = [];
	setTimeout(async () => {
		results3 = await axios.all(requests[2].map(func => func()));
		console.log(results3);
		const joined_results = results.concat(results2, results3);
		console.log(joined_results);
		const cities = joined_results.map(
			res => res.data.addresses[0].address.countryTertiarySubdivision
		);
		console.log(cities);
		return cities;
	}, 2000);
};

module.exports = app => {
	app.get("/trip/:location", (req, res) => {
		console.log("calling calculate route with location:", req.params.location);
		tomtom
			.get("/routing/1/calculateRoute/" + req.params.location + "/json", {
				params: {
					key: keys.tomtomApiKey
				}
			})
			.then(response => {
				try {
					console.log("res from tomtom:", response.data);
					const points_list = response.data.routes[0].legs[0].points.map(
						pt => Object.values(pt)
					);
					const numEntries = points_list.length;
					console.log("num entries", numEntries);

					const routePoints = [];
				
					console.log("first points list", points_list[0]);
					for (let i = 0; i < points_list.length; i++) {
						if (i % Math.floor(numEntries / 14) === 0) {
							routePoints.push(points_list[i]);
						}
					}
					console.log("num route points:", routePoints.length);
					//const cities = reverseGeocode(routePoints);
					//console.log("cities:", cities);
					res.status(200).send(routePoints);
				} catch (err) {
					console.log(err);
				}
			})
			.catch(err => res.status(500).send(err));
	});
};
