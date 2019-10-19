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
	if(process.env.NODE_ENV === 'production') {
		//1.express will serve up production assets like main.js
		app.use(express.static('WeatherTrip/build'))

		//express will serve up the index.html file if it doesn't recognize the route
		const path = require("path");
		app.get("*", (req, res) => {
			res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')
		});
	}
	console.log("Attatched routes.");
	const PORT = process.env.PORT || 5000;
	app.listen(PORT);
});
