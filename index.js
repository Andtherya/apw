// index.js
const os = require("os");
const https = require("https");

function getPublicIP() {
  return new Promise((resolve) => {
    https.get("https://api.ipify.org?format=json", (resp) => {
      let data = "";
      resp.on("data", (chunk) => data += chunk);
      resp.on("end", () => {
        try {
          resolve(JSON.parse(data).ip);
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

module.exports = async function (req, res) {
  const uptime = os.uptime();
  const load = os.loadavg();
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const cpuInfo = os.cpus();

  // 用户访问 IP
  const clientIP = req.headers["x-forwarded-for"] || req.ip || null;
  // 函数容器公网 IP
  const publicIP = await getPublicIP();

  const data = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptime,
    loadavg: load,
    memory: {
      total: memTotal,
      free: memFree,
      used: memTotal - memFree,
      usage: ((memTotal - memFree) / memTotal * 100).toFixed(2) + "%"
    },
    cpu: {
      model: cpuInfo[0].model,
      cores: cpuInfo.length,
      speed: cpuInfo[0].speed
    },
    network: {
      clientIP,
      publicIP
    },
    timestamp: new Date().toISOString()
  };

  res.json(data);
};
