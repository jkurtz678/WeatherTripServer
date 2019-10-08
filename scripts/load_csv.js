const csv_parser = require("csv-parser");
const fs = require("fs");

//loads csv from given path
module.exports = function loadCSV(csv_path) {
	console.log("Loading csv...");
	const entry_rows = [];
	fs.createReadStream(csv_path)
		.pipe(csv_parser())
		.on("data", row => {
			entry_rows.push(row);
		})
		.on("end", () => {
			console.log("CSV file successfully loaded.");
			/*
			const ventura = us_cities.filter(entry => entry.city == "Ventura");
			console.log("ventura:", ventura[0]["population"]);*/
			return entry_rows;
		});
}
