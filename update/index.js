const kafka = require('kafka-node');
const uuidv4 = require('uuid/v4');
var mongoose = require('mongoose');
var shows = require("./model/shows");
let consumer;
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    hosts: ['http://elastic:changeme@elasticsearch:9200']
});

let mongoHealth = false,
    elkHealth = false,
    kafkaHealth = false;

const connect = async () => {
    client.ping({
        requestTimeout: 30000,
    }, function (error) {
        if (error) {
            console.error('elasticsearch cluster is down!');
        } else {
            console.log('Everything is ok');
            elkHealth = true;
            client.indices.delete({
                index: 'update-log'
            }, function (err, resp, status) {
                if (!err) {
                    console.log("update", resp);
                }
            });
        }
    });
    mongoose.connect("mongodb://mongodb:27017/microservice", function (error) {
        if (error) {
            console.log("error" + error);
        } else {
            mongoHealth = true;
            console.log("open done")
        }
    });
};

setInterval(function () {
    if (!mongoHealth || !elkHealth)
        connect();
    else if (!kafkaHealth) {
        bootstrap();
    } else {
        client.index({
            index: 'update-log',
            id: uuidv4(),
            type: 'GET',
            body: {
                timeStamp: (new Date()).toString(),
                message: "Everything ok!"
            }
        }, function (err, resp, status) {
            //console.log(resp);
        });
    }
}, 5000);

const update = async (body) => {
    try {
        console.log(body);

        let op = await shows.findByIdAndUpdate(body.id, body.update);

        client.index({
            index: 'update-log',
            id: uuidv4(),
            type: 'GET',
            body: {
                inputs: body,
                output: op,
            }
        }, function (err, resp, status) {
            console.log(resp);
        });

    } catch (ex) {
        console.log(ex);
    }
}

const bootstrap = async (retry = 0) => {
    try {
        if(retry >= 10 || kafkaHealth)
            return;
        const Consumer = kafka.Consumer;
        const client = new kafka.KafkaClient({
            kafkaHost: 'kafkaq:9092',
            autoConnect: true,
        });
        consumer = new Consumer(
            client,
            [{
                topic: "update.com",
                partition: 0
            }], {
                autoCommit: true,
                fetchMaxWaitMs: 1000,
                fetchMaxBytes: 1024 * 1024,
                encoding: 'utf8',
                fromOffset: false
            }
        );
        consumer.on('message', async function (message) {
            kafkaHealth = true;
            console.log('here');
            console.log(
                'kafka-> ',
                message.value
            );
            let body = JSON.parse(message.value.toString());
            await update(body);
        })
        consumer.on('error', function (err) {
            kafkaHealth = false;
            console.log('error', err);
            bootstrap(++retry);
        });
    } catch (e) {
        console.log(e);
    }
}


/**
 * Gracefully shut it down
 */
process.on("SIGTERM", () => {
    process.exit(0);
});
process.on("SIGINT", () => {
    process.exit(0);
});