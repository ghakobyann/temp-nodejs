const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const myRoute = require("./routes/router.js");
require("dotenv").config();

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to the Database!"))
    .catch(() => console.error("Couldn't connect to the Database! :("));

app.use(cors());
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/users", myRoute);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log(
        `Your app is listening on port ${listener.address().port}`,
        `\nVisit http://localhost:${listener.address().port}`
    );
});
