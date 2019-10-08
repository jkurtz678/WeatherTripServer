const express = require("express");
const loadCSV = require ('./scripts/load_csv.js');
const app = express();

//starts server, first loading csv into memory
async function bootServer() {
	//relative to scripts folder
	const cities_csv = "./data/uscities.csv";
	const us_cities_data = await loadCSV(cities_csv);

	require("./routes/trip")(app, us_cities_data);
	const PORT = process.env.PORT || 5000;
	app.listen(PORT);
}

bootServer();