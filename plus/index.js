const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const config = require("./config");
const uuidv4 = require('uuid/v4');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    hosts: ['http://elastic:changeme@elasticsearch:9200']
});

const connect = async () => client.ping({
    requestTimeout: 30000,
}, function (error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
        client.indices.create({
            index: 'plus-log'
        }, function (err, resp, status) {
            if (!err) {
                console.log("create", resp);
            }
        });
    }
});

setInterval(function(){ connect(); }, 5000);

app.use((req, res, next) => {
    req["startTime"] = (+new Date()).toString();
    next();
});

app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

app.post("/plus", (req, res, next) => {
    try {
        console.log(req.body);
        res.status(200).json({
            Answer: parseInt(req.body.a) + parseInt(req.body.b)
        });

        client.index({
            index: 'plus-log',
            id: uuidv4(),
            type: 'GET',
            body: {
                inputs: req.body,
                start: req.startTime,
                end: (+new Date()).toString()
            }
        }, function (err, resp, status) {
            console.log(resp);
        });

    } catch (ex) {
        console.log(ex);
        next(ex);
    }
});

app.get("/plus", (req, res, next) => {
    try {
        console.log(req.query);
        res.status(200).json({
            Answer: parseInt(req.query.a) + parseInt(req.query.b)
        });

        client.index({
            index: 'plus-log',
            id: uuidv4(),
            type: 'GET',
            body: {
                inputs: req.query,
                start: req.startTime,
                end: (+new Date()).toString()
            }
        }, function (err, resp, status) {
            console.log(resp);
        });

    } catch (ex) {
        console.log(ex);
        next(ex);
    }
});

app.use((err, req, res, next) => {
    const errorObj = {
        service: "plus"
    };
    if (err.status === 400) {
        if (err.validationErrors) {
            errorObj.validationErrors = err.validationErrors;
        }
        errorObj.message = err.message || "Invalid Values Supplied";
        errorObj.head = err.head || null;
    } else if (err.status === 401 || err.status === 403) {
        errorObj.head = err.head || null;
        errorObj.message = err.message || "Unauthorized User";
    } else if (err.status === 500) {
        errorObj.head = err.head || null;

        errorObj.message = err.message;

        errorObj.message = "Internal Server Error";
    } else if (err.status === 404) {
        errorObj.head = err.head || null;
        errorObj.message = err.message;
    } else {
        errorObj.head = err.head || null;

        errorObj.message = err.message || "Unknown Error Occurred";
    }

    client.index({
        index: 'plus-log',
        id: uuidv4(),
        type: 'GET',
        body: {
            inputs: errorObj,
            start: req.startTime,
            end: (+new Date()).toString()
        }
    }, function (err, resp, status) {
        console.log(resp);
    });

    next();
    return res.status(err.status || 500).json(errorObj);
});

/**
 * Gracefully shut it down
 */
process.on("SIGTERM", () => {
    process.exit(0);
});
process.on("SIGINT", () => {
    process.exit(0);
});

app.listen(config.PORT, "0.0.0.0", () => {
    console.log("Starting server on port ", config.PORT);
    console.log(config);
});