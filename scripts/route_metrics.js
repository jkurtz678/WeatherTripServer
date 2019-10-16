const tomtom = require("../config/tomtom");
const keys = require("../config/keys");

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
	const date = timestamp.substring(0, start-1);
	let [hr, min] = military.split(":");
	let period = "am";
	if (parseInt(hr) > 12) {
		hr = hr % 12;
		period = "pm";
	}

	if (hr === "00") {
		hr = 12;
	}
	return [date, military, hr + ":" + min + period];
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
		const startDateTime = extractTime(
			response.data.routes[0].legs[0].summary.departureTime
		);
		best_cities[0]["date"] = startDateTime[0];
		best_cities[0]["military_time"] = startDateTime[1];
		best_cities[0]["time"] = startDateTime[2];

		for (const [
			i,
			summaryPoint
		] of response.data.routes[0].legs.entries()) {
			console.log("length:", summaryPoint.summary.lengthInMeters);
			totalDist += summaryPoint.summary.lengthInMeters;
			best_cities[i + 1]["distance"] = getMiles(totalDist);
			const dateTime = extractTime(summaryPoint.summary.arrivalTime);
			best_cities[i + 1]["date"] = dateTime[0];
			best_cities[i + 1]["military_time"] = dateTime[1];
			best_cities[i + 1]["time"] = dateTime[2];
		}
		console.log('sending metrics callback...');
		callback(best_cities);
	});
}

module.exports = getRouteMetrics;
