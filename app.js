const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const configs = require("./src/config/config.js");
let port = process.env.PORT || configs.PORT;
const path = require('path')
const mongodb = require("./src/database/database");


// db config 
mongodb.createDbConnection();


//using bodyParse
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/static', express.static(path.join(__dirname, '/src/static')))
// for using static files 
app.use(express.static(`${__dirname}/public`))

//route for user or customer 
const userRouter = require("./src/routers/user.router");
app.use("/user", userRouter);

//route for user or customer 
const adminRouter = require("./src/routers/admin.router");
app.use("/admin", adminRouter);

//route for user or client 
const clientRouter = require("./src/routers/client.router");
app.use("/client", clientRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port} successfully`);
});