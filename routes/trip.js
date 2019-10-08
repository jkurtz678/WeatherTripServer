const tomtom = require("../config/tomtom");
const keys = require("../config/keys");
const axios = require("axios");

//deletes duplicates and cleans city name of "-"
function cleanCities(cities) {
	//remove duplicates
	const unique_cities_set = new Set(cities.map(c => JSON.stringify(c)));
	const unique_cities = Array.from(unique_cities_set).map(c => JSON.parse(c));

	//remove chars after and including '-'
	const new_cities = unique_cities.map(c => {
		c["city"] = c["city"].split("-")[0];
		return c;
	});
	return new_cities;
}

//add population from corresponding city into data set, remove if not found
function addPopulations(cities, us_cites_data) {
	for (let i = 0; i < cities.length; i++) {
		const csv_entry = us_cites_data.filter(
			entry =>
				entry.city == cities[i].city &&
				entry.state_id == cities[i].state
		);
		if (csv_entry[0]) {
			cities[i]["population"] = csv_entry[0]["population"];
			cities[i]["order"] = i;
		} else {
			cities.splice(i, 1);
			i--;
		}
	}
	return cities;
}

//find three most populated cities between start and end
//return array with start, end, relevant middle cities
function assembleCities(cities) {
	//remove first and last for start and end locations
	const start = cities.splice(0, 1);
	const destination = cities.splice(cities.length - 1, 1);
	console.log("start:", start);
	console.log("destination:", destination);

	//find three largest cities, and maintain order
	cities.sort((a, b) => {
		return parseFloat(a.population) < parseFloat(b.population) ? 1 : -1;
	});

	const top_three = cities.splice(0, 3);
	top_three.sort((a, b) => {
		return a.order > b.order ? 1 : -1;
	});

	//add start and end and middle cities to one array.
	const best_cities = start.concat(top_three, destination);

	//remove order prop
	best_cities.forEach(c => delete c.order);
	return best_cities;
}

//keeps first and last and returns largest cities in between
const getBestCities = (cities, us_cities_data) => {
	const cleaned_cities = cleanCities(cities);
	const population_cities = addPopulations(cleaned_cities, us_cities_data);
	return assembleCities(population_cities);
};

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
