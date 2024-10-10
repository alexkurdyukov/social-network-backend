const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const routes = require("./routes");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "jade");

app.use("/uploads", express.static("uploads"));

app.use("/api", routes);

// проверка что папка uploads существует, если нет, создадим и будем там хранить картинки
if (!fs.existsSync("uploads")) {
	fs.mkdirSync("uploads");
}

app.use(function (req, res, next) {
	next(createError(404));
});

app.use(function (err, req, res) {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
