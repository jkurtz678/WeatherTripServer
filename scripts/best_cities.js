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
function getBestCities(cities, us_cities_data) {
	const cleaned_cities = cleanCities(cities);
	const population_cities = addPopulations(cleaned_cities, us_cities_data);
	return assembleCities(population_cities);
};

module.exports = getBestCities;