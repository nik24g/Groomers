// Groomer project started in month of july in 2023
// Projected first version finished in 30/11/2023
// Originated and First version is only developed by Nitin Goswami
// 7999676443 || nitingoswami1900@gmail.com || www.nitingoswami.xyz
const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const configs = require("./src/config/config.js");
let port = process.env.PORT || configs.PORT;
const path = require("path");
const mongodb = require("./src/database/database");
const cors = require("cors");

// db config
mongodb.createDbConnection();

//using bodyParse
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// app.use('/static', express.static(path.join(__dirname, '/src/static')))
// for using static files
app.use("/public", express.static(`${__dirname}/public`));

//route for user or customer
const userRouter = require("./src/routers/user.router");
app.use("/user", userRouter);

//route for user or customer
const adminRouter = require("./src/routers/admin.router");
app.use("/admin", adminRouter);

//route for user or client
const clientRouter = require("./src/routers/client.router");
app.use("/client", clientRouter);

//route for payment
const paymentRouter = require("./src/routers/payment.router.js");
app.use("/payment", paymentRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port} successfully`);
});

//developed by Nitin Goswami