const express = require("express");
const router = express.Router();

const createError = require("http-errors");


const miscControllers = require("../controllers/misc.controller");
const queryController = require("../controllers/query.controller")
const invokeController = require("../controllers/invoke.controller")



const methodNotAllowed = (req, res, next) => next(createError(405, "Method not allowed"));

router
    .route("/")
    .get(miscControllers.root)
    .all(methodNotAllowed)

router
    .route("/invoke")
    .post(invokeController.invoke)
    .all(methodNotAllowed)
    
router
    .route("/query")
    .get(queryController.query)
    .all(methodNotAllowed)

module.exports = router;