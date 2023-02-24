const ping = require('ping');
const express = require('express');
const fs = require('fs');

const app = express();
const dbname = 'checkindb.json'
const subnet = process.env.LM_SUBNET // CIDR Notation subnet
const pollInterval = process.env.LM_POLL_INTERVAL * 1000 // Time in sec
const hosts = getAllIPsInRange(subnet)

let statusObj = {};

try {
    const fileData = fs.readFileSync(dbname);
    if (fileData.length > 0) {
        statusObj = JSON.parse(fileData);
    }
    } catch (err) {
    if (err.code !== 'ENOENT') {
        console.error(`Error reading ${dbname}: ${err}`);
    }
}

function getAllIPsInRange(cidr) {
    const ipArray = cidr.split('/');
    const ipAddr = ipArray[0];
    const prefixLength = parseInt(ipArray[1], 10);
    const block = ipAddr.split('.');
    const n = 32 - prefixLength;
    const start = (block[0] << 24) | (block[1] << 16) | (block[2] << 8) | +block[3];
    const end = start + Math.pow(2, n) - 1;

    let ipList = [];
    for (let i = start; i <= end; i++) {
        const currentIP = (i >>> 24) + '.' + (i >> 16 & 255) + '.' + (i >> 8 & 255) + '.' + (i & 255);
        ipList.push(currentIP);
    }
    if (ipList.length > 2) {
        ipList = ipList.slice(1, -1);
        return ipList;
    } else {
        return ipList;
    }
}

function writeObjectToFile(obj, filePath) {
    const jsonData = JSON.stringify(obj);
    fs.writeFileSync(filePath, jsonData);
}

function asyncPing() {
    const pingPromises = hosts.map(async (host) => {
        const result = await ping.promise.probe(host, { timeout: 1.5, min_reply: 3 });
        const status = result.alive ? 'up' : 'down';
        let currentTimestamp = new Date;
        if (statusObj[host] === undefined) {
            statusObj[host] = { status: status, lastCheckin: 'never' };
        } else if (statusObj[host].status !== status) {
            statusObj[host].status = status;
            if (status === 'up') {
                statusObj[host].lastCheckin = currentTimestamp;
            }
        } else if (statusObj[host].status === status) {
            statusObj[host].status = status;
            if (status === 'up') {
                statusObj[host].lastCheckin = currentTimestamp;
            }
        }
    });

    Promise.all(pingPromises).then(() => {
        //console.log('Ping completed.');
    }).catch((err) => {
        console.error(err);
    });

    writeObjectToFile(statusObj, dbname)
}

setInterval(asyncPing, pollInterval);

app.get('/api/v1/ips', (req, res) => {
    console.log('[GET] - /api/v1/ips')
    res.json(statusObj);
});

app.listen(3000, () => {
    console.log('Server started on port 3000.');
});
