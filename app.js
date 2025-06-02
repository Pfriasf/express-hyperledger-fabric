require("dotenv").config();

const createError = require("http-errors");
const httpLogger = require("morgan");
const express = require("express");
const cors = require("cors");

const logger = require("./helpers/logger")
const eventHelper = require("./helpers/event-helper");
logger.category = "server"

const app = express();

/* Middlewares */

app.use(express.json());
app.use(httpLogger("dev"));
app.use(cors());

/* Routes */

const routes = require("./config/routes.config");
app.use("/api", routes);

/* Handle Errors */

app.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

app.use((err, req, res, next) => {
  let error = {}
  if (err.status == undefined){
    error.message = {"Error": createError.InternalServerError().message}
    error.status = 500
  } else {
    error = err
  }
  res.status(error.status).json(error);

});

const port = Number(process.env.PORT || 4001);
app.listen(port, () => {
  logger.info('****************** SERVER STARTED ************************');
  logger.info('**************  Listening on port: %s  *****************', port);
});

eventHelper.registerBlockListener();
eventHelper.registerChaincodeListener();