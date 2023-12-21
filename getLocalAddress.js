const { networkInterfaces } = require('os');

function getIPv4Address() {
    const net_list = networkInterfaces();
    const results = {};

    for (let net_key in net_list){
        let nets = net_list[net_key];
        for (let index in nets) {
            let netInfo = nets[index];
            console.log(netInfo["address"]);
            if (netInfo["family"] == "IPv4") {
                return netInfo["address"];
            }
        }   
    }
}

module.exports = {
    getIPv4Address
};
