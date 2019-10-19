const axios = require("axios");

module.exports =  axios.create({
	baseURL: "https://api.darksky.net/forecast/3e907fd9fa00a82e7e834502ae57f7fe/"
});