const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { device } = require('aws-iot-device-sdk');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const mqttDevice = device({
    clientId: '94a63b36-70e3-11ee-b962-0242ac120002',
    host: 'a1cm3c34iajtv7-ats.iot.us-east-1.amazonaws.com',
    port: 8883,
    keyPath: './AWS_secrets/private.pem.key',
    certPath: './AWS_secrets/certificate.pem.crt',
    caPath: './AWS_secrets/rootCA.pem',
});

mqttDevice.on('connect', function() {
    console.log('Connected to MQTT broker');
    mqttDevice.subscribe('wheelChair/position', function(err) {
        if (err) {
            console.error('Error subscribing to topic:', err);
        }
    });
});

wss.on('connection', function connection(ws) {
    console.log("Connected to WebSocket")
    console.log('Client connected to WebSocket');

    mqttDevice.on('message', function(topic, payload) {
        console.log(topic)
        console.log(payload)
        ws.send(JSON.stringify({ topic, message: payload.toString() }));
    });

    ws.on('close', function close() {
        console.log('Client disconnected from WebSocket');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, function() {
    console.log(`Server started on port ${PORT}`);
});
