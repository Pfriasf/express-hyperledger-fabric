const path = require("path");

const log4js = require("log4js");

log4js.configure({
  appenders: {
    out: { type: "stdout" },
    app: {
      type: "file",
      filename:
        process.env.LOG_FILE || path.join(process.cwd(), "logs/app.log"),
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
    },
  },
  categories: {
    default: { appenders: ["out", "app"], level: "debug" },
  },
});

const logger = log4js.getLogger();

module.exports = logger;
