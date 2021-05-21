const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const db = require("./models");
const app = express();
var cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

try {
  db.sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

// db.sequelize.sync();
// drop the table if it already exists
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
});

// simple route
app.get("/", (req, res) => {

  res.json({ message: "Welcome to application." });
});

require("./routes/login.routes")(app);
require("./routes/signup.routes")(app);
require("./routes/welcome.routes")(app);

app.use(express.static(path.join(__dirname, 'views')));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
