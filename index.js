const express = require("express");
const loadCSV = require("./scripts/load_csv.js");
const app = express();

//starts server, first loading csv into memory
const cities_csv = "./data/uscities.csv";
loadCSV(cities_csv, cities_data => {
	if (!cities_data) {
		console.log("Failed to wait for csv!");
	}
	require("./routes/trip")(app, cities_data);
	console.log("Attatched routes.");
	const PORT = process.env.PORT || 5000;
	app.listen(PORT);
});
