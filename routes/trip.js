const tomtom = require("../config/tomtom");
const keys = require("../config/keys");

const getCitiesList = require("../scripts/route_cities");
const getBestCities = require("../scripts/best_cities");
const getRouteMetrics = require("../scripts/route_metrics");
const getWeather = require("../scripts/weather");

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
				console.log("getting cities list...");
				try {
					getCitiesList(response, 32, cities => {
						//console.log("cities:", cities);
						const best_cities = getBestCities(cities, uscities);
						console.log("getting route metrics...");
						getRouteMetrics(best_cities, routeMetrics => {
							console.log("route metrics:", routeMetrics);
							getWeather(routeMetrics, weatherResults => {
								res.status(200).send(weatherResults);
							});
						});
						//res.status(200).send(best_cities);
					});
				} catch (err) {
					console.log(err);
				}
			})
			.catch(err => res.status(500).send(err));
	});

	app.get("/location/:location", (req, res) => {
		console.log("getting route data from TOMTOM:", req.params.location);
		tomtom
			.get("/search/2/search/" + req.params.location + ".json", {
				params: {
					key: keys.tomtomApiKey,
					limit: 1
				}
			})
			.then(response => {
				console.log("sending location response...");
				const res_city = response.data.results[0];

				console.log(response.data.results);
				if (
					typeof res_city.position.lat === "undefined" ||
					typeof res_city.position.lon === "undefined" ||
					typeof res_city.address.countrySubdivision ===
						"undefined" ||
					typeof res_city.address.countryTertiarySubdivision ===
						"undefined"
				) {
					console.log(
						"Unable to get information for given location!"
					);
					res.status(404).send();
				} else {
					const city = {};

					city["lat"] = res_city.position.lat;
					city["lon"] = res_city.position.lon;
					city["state"] = res_city.address.countrySubdivision;
					city["city"] = res_city.address.countryTertiarySubdivision;
					console.log("city before send:", city);

					try {
						res.status(200).send(city);
					} catch (err) {
						console.log(
							"ERROR: unable to get location from TOMTOM"
						);
						res.status(500).send(err);
					}
				}
			})
			.catch(err => {
				console.log("error:", err);
				res.status(500).send(err);
			});
	});

	app.get("/test/cities", (req, res) => {
		console.log("running test/cities handler...");

		const best_cities = [
			{
				city: "Los Angeles",
				date: "2019-10-18",
				distance: 50,
				icon: "clear-day",
				temp: 76,
				order: 0,
				summary: "clear",
				time: "3:47pm",
				military_time: "15:47",
				state: "CA",
				latitude: 34.05223,
				longitude: -118.24335,
				population: "12815475.0"
			},
			{
				city: "Simi Valley",
				state: "CA",
				temp: 76,
				latitude: 34.28734,
				longitude: -118.79931,
				population: "127864.0",
				date: "2019-10-18",
				distance: 50,
				icon: "clear-day",
				order: 0,
				summary: "clear",
				time: "3:47pm",
				military_time: "15:47"
			},
			{
				city: "Santa Barbara",
				state: "CA",
				latitude: 34.44093,
				temp: 76,
				longitude: -119.75532,
				population: "204034.0",
				date: "2019-10-18",
				distance: 50,
				icon: "clear-day",
				order: 0,
				summary: "clear",
				time: "3:47pm",
				military_time: "15:47"
			},
			{
				city: "Santa Maria",
				state: "CA",
				latitude: 34.88008,
				longitude: -120.4087,
				temp: 76,
				population: "140219.0",
				date: "2019-10-18",
				distance: 50,
				icon: "clear-day",
				order: 0,
				summary: "clear",
				time: "3:47pm",
				military_time: "15:47"
			},
			{
				city: "San Luis Obispo",
				state: "CA",
				latitude: 35.28261,
				longitude: -120.66002,
				temp: 76,
				population: "62398.0",
				date: "2019-10-18",
				distance: 50,
				icon: "clear-day",
				order: 0,
				summary: "clear",
				time: "3:47pm",
				military_time: "15:47"
			}
		];
		getRouteMetrics(best_cities, routeMetrics => {
			res.status(200).send(routeMetrics);
		});
	});
};
