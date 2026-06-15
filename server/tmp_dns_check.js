const dns = require("dns").promises;
console.log("Node version:", process.version);
console.log("DNS servers:", require("dns").getServers());

dns
  .resolveSrv("_mongodb._tcp.cluster-1.4gula.mongodb.net")
  .then((records) => {
    console.log("SRV records:", records);
  })
  .catch((error) => {
    console.error("DNS error:", error);
    process.exit(1);
  });
