const tomtom = require("../config/tomtom");
const keys = require("../config/keys");

const getCitiesList = require("../scripts/route_cities");
const getBestCities = require("../scripts/best_cities");

async function getWaypointRoute(routeCoords, callback) {
	const response = await tomtom.get(
		"/routing/1/calculateRoute/" + routeCoords + "/json",
		{
			params: {
				key: keys.tomtomApiKey,
				routeRepresentation: "summaryOnly"
			}
		}
	);
	callback(response);
}

function getPosition(string, subString, index) {
	return string.split(subString, index).join(subString).length;
}

function extractTime(timestamp) {
	const start = timestamp.indexOf("T") + 1;
	const end = getPosition(timestamp, ":", 2);
	const military = timestamp.substring(start, end);
	let [hr, min] = military.split(":");
	let period = "am";
	if (parseInt(hr) > 12) {
		hr = hr % 12;
		period = "pm";
	}
	return hr + ":" + min + period;
}

function getMiles(i) {
	return Math.round(i * 0.000621371192 * 10) / 10;
}

function getRouteMetrics(best_cities, callback) {
	let routeCoords = "";
	for (const city of best_cities) {
		let coords = city["latitude"] + "," + city["longitude"] + ":";
		routeCoords += coords;
	}
	routeCoords = routeCoords.substring(0, routeCoords.length - 1);
	console.log("routeCoords:", routeCoords);

	getWaypointRoute(routeCoords, response => {
		console.log("waypoint route response:", response.data.routes[0].legs);
		let totalDist = 0;
		best_cities[0]["distance"] = 0;

		best_cities[0]["time"] = extractTime(
			response.data.routes[0].legs[0].summary.departureTime
		);
		for (const [
			i,
			summaryPoint
		] of response.data.routes[0].legs.entries()) {
			console.log("length:", summaryPoint.summary.lengthInMeters);
			totalDist += summaryPoint.summary.lengthInMeters;
			best_cities[i + 1]["distance"] = getMiles(totalDist);
			best_cities[i + 1]["time"] = extractTime(
				summaryPoint.summary.arrivalTime
			);
		}
		callback(best_cities);
	});
}

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
						console.log("sending route response...");
						getRouteMetrics(best_cities, routeMetrics => {
							res.status(200).send(routeMetrics);
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
				res.status(200).send(response.data.results[0].position);
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
				state: "CA",
				latitude: 34.05223,
				longitude: -118.24335,
				population: "12815475.0"
			},
			{
				city: "Simi Valley",
				state: "CA",
				latitude: 34.28734,
				longitude: -118.79931,
				population: "127864.0"
			},
			{
				city: "Santa Barbara",
				state: "CA",
				latitude: 34.44093,
				longitude: -119.75532,
				population: "204034.0"
			},
			{
				city: "Santa Maria",
				state: "CA",
				latitude: 34.88008,
				longitude: -120.4087,
				population: "140219.0"
			},
			{
				city: "San Luis Obispo",
				state: "CA",
				latitude: 35.28261,
				longitude: -120.66002,
				population: "62398.0"
			}
		];
		getRouteMetrics(best_cities, routeMetrics => {
			res.status(200).send(routeMetrics);
		});
	});
};
