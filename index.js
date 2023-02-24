var ping = require('ping');

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


async function asyncPing(hosts) {
    const pingPromises = hosts.map((host) => {
        return ping.promise.probe(host, { timeout: 1.5, min_reply: 3 });
    });

    return Promise.all(pingPromises).then((results) => {
        const statusObj = {};

        results.forEach((result, index) => {
        const host = hosts[index];
        statusObj[host] = result.alive ? 'up' : 'down';
        });

        return statusObj;
    });
}

function continuousPing() {
    console.log('Initiating LAN sweep');

    const subnet = process.env.LM_SUBNET;
    const hosts = getAllIPsInRange(subnet);
    console.log(`Pinging hosts: ${hosts}`)
    setInterval(() => {
        asyncPing(hosts).then((statusObj) => {
            console.log(statusObj);
        }).catch((err) => {
            console.error(err);
        });
    }, 5000);
}

continuousPing()