const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const configs = require("./src/config/config.js");
let port = process.env.PORT || configs.PORT;
const path = require('path')
const mongodb = require("./src/database/database");
mongodb.createDbConnection();


//using bodyParse
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/static', express.static(path.join(__dirname, '/src/static')))

app.listen(port, () => {
    console.log(`Server is running on port ${port} successfully`);
});