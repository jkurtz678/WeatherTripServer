const tomtom = require("../config/tomtom");
const keys = require("../config/keys");

const getCitiesList = require("../scripts/route_cities");
const getBestCities = require("../scripts/best_cities");

module.exports = (app, uscities) => {
	app.get("/trip/:location", (req, res) => {
		console.log("getting route data from TOMTOM:", req.params.location);
		tomtom
			.get("/routing/1/calculateRoute/" + req.params.location + "/json", {
				params: {
					key: keys.tomtomApiKey
				}
			})
			.then(response => {
				try {
					getCitiesList(response, 15, cities => {
						//console.log("cities:", cities);
						const best_cities = getBestCities(cities, uscities);
						console.log("sending response...")
						res.status(200).send(best_cities);
					});
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
