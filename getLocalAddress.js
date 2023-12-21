const { networkInterfaces } = require('os');

function getIPv4Address() {
    const net_list = networkInterfaces();

    for (let net_key in net_list){
        let nets = net_list[net_key];
        for (let index in nets) {
            let netInfo = nets[index];
            if (netInfo["family"] == "IPv4") {
                if (netInfo["address"] != "127.0.0.1")
                    return netInfo["address"];
            }
        }   
    }

    return "127.0.0.1";
}

module.exports = {
    getIPv4Address
};
