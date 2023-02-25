const { networkInterfaces } = require('os');

function getIPv4Address() {
    const nets = networkInterfaces()["wlp2s0"] || networkInterfaces()["eth0"];
    const results = {}; // Or just '{}', an empty object

    for (let index in nets) {
        let netInfo = nets[index];
        if (netInfo["family"] == "IPv4") {
            return netInfo["address"];
        }
    }
}

module.exports = {
    getIPv4Address
};
