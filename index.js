const express = require('express');
const app = express();

require("./routes/trip")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);