const tomtom = require("../config/tomtom");
const keys = require("../config/keys");
const axios = require("axios");
const getBestCities = require('../scripts/best_cities');

const reverseGeocode = point => {
	const loc_string = point[0] + "," + point[1];
	return tomtom.get("/search/2/reverseGeocode/" + loc_string + ".json", {
		params: {
			key: keys.tomtomApiKey
		}
	});
};

const reverseGeocodePoints = async (points, res) => {
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

		//make new object with just city and state names
		const cities = joined_results.map(res => {
			const cityObj = {};
			const res_json = res.data.addresses[0].address;
			cityObj["city"] = res_json.countryTertiarySubdivision;
			cityObj["state"] = res_json.countrySubdivision;
			return cityObj;
		});
		console.log(cities);
		res.status(200).send(cities);
	}, 2000);
};

module.exports = (app, uscities) => {
	app.get("/trip/:location", (req, res) => {
		console.log(
			"calling calculate route with location:",
			req.params.location
		);
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
					reverseGeocodePoints(routePoints, res);
					//console.log("cities:", cities);
				} catch (err) {
					console.log(err);
				}
			})
			.catch(err => res.status(500).send(err));
	});

	app.get("/test/cities", (req, res) => {
		console.log("running test/cities handler...");
		const cities = [
			{
				city: "Los Angeles",
				state: "CA"
			},
			{
				city: "Los Angeles",
				state: "CA"
			},
			{
				city: "Los Angeles",
				state: "CA"
			},
			{
				city: "San Fernando Valley",
				state: "CA"
			},
			{
				city: "Thousand Oaks",
				state: "CA"
			},
			{
				city: "Camarillo",
				state: "CA"
			},
			{
				city: "Ventura",
				state: "CA"
			},
			{
				city: "Carpinteria",
				state: "CA"
			},
			{
				city: "Santa Barbara",
				state: "CA"
			},
			{
				city: "Santa Barbara",
				state: "CA"
			},
			{
				city: "Solvang-Santa Ynez",
				state: "CA"
			},
			{
				city: "Solvang-Santa Ynez",
				state: "CA"
			},
			{
				city: "Santa Maria",
				state: "CA"
			},
			{
				city: "Arroyo Grande",
				state: "CA"
			},
			{
				city: "San Luis Obispo",
				state: "CA"
			}
		];
		const best_cities = getBestCities(cities, uscities);
		res.status(200).send(best_cities);
	});
};
