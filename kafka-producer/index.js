const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const config = require("./config");
const uuidv4 = require('uuid/v4');
const kafka = require('kafka-node');
let producer;
let kafkaHealth = false;

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    hosts: ['http://elastic:changeme@elasticsearch:9200']
});

let elkHealth = false;

const connect = async () => {
    if (!elkHealth) {
        client.ping({
            requestTimeout: 30000,
        }, function (error) {
            if (error) {
                console.error('elasticsearch cluster is down!');
            } else {
                console.log('Everything is ok');
                elkHealth = true;
                client.indices.create({
                    index: 'kafka-producer-log'
                }, function (err, resp, status) {
                    if (!err) {
                        console.log("create", resp);
                    }
                });
            }
        });
    }
};

const kafkaRetry = (retry = 0) => {
    try {
        if (retry >= 10 || kafkaHealth) {
            return;
        }
        const Producer = kafka.Producer;
        const client = new kafka.KafkaClient({
            kafkaHost: 'kafkaq:9092',
            autoConnect: true,
        });
        producer = new Producer(client);
        console.log("Connecting to kafka");
        producer.on('ready', async function () {
            console.log("Connected to Kafka!");
            kafkaHealth = true;
        });

        producer.on('error', function (err) {
            kafkaHealth = false;
            console.log("Kafka err: "+err);
            kafkaRetry(++retry);
        });
    } catch (e) {
        console.log(e);
    }
}

setInterval(function () {
    connect();
    kafkaRetry();
    client.index({
        index: 'kafka-producer-log',
        id: uuidv4(),
        type: 'LOG',
        body: {
            timeStamp: (new Date()).toString(),
            message: "Everything ok!"
        }
    }, function (err, resp, status) {
        console.log(resp);
    });
}, 5000);

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

app.post("/", async (req, res, next) => {
    try {

        let kafka_topic = req.headers["x-forwarded-host"];

        console.log(req.headers["x-forwarded-host"], req.body);

        let payloads = [{
            topic: kafka_topic,
            messages: JSON.stringify(req.body)
        }];

        producer.send(payloads, (err, data) => {
            if (err) {
                console.log('[kafka-producer -> ' + kafka_topic + ']: broker update failed', err);
            } else {
                console.log('[kafka-producer -> ' + kafka_topic + ']: broker update success');
            }
        });

        res.send(true);

        client.index({
            index: 'kafka-producer-log',
            id: uuidv4(),
            type: 'LOG',
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

app.get("/ping", (req, res) => res.send("pong"));

app.use((err, req, res, next) => {
    const errorObj = {
        service: "kafka-producer"
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
    kafkaHealth = false;
    elkHealth = false;
    client.index({
        index: 'kafka-producer-log',
        id: uuidv4(),
        type: 'LOG',
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