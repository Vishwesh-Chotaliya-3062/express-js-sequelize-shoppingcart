const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { sequelize } = require("./models/db");
const app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

var cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

sequelize.sync();
// drop the table if it already exists
// sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});

require("./routes/login.routes")(app);
require("./routes/signup.routes")(app);
require("./routes/welcome.routes")(app);
require("./routes/verify.routes")(app);
require("./routes/cart.routes")(app);
require("./routes/couponcode.routes")(app);
require("./routes/orderdetails.routes")(app);
require("./routes/useraddress.routes")(app);
require("./routes/wallet.routes")(app);
require("./routes/history.routes")(app);
require("./routes/changepassword.routes")(app);
require("./routes/userprofile.routes")(app);

app.use(express.static(path.join(__dirname, "views")));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
