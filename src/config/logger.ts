import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "auth-service",
  },
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json(),
    winston.format.colorize({
      colors: { info: "green", warn: "yellow", error: "red" },
    }),
  ),

  transports: [
    new winston.transports.File({
      dirname: "logs",
      filename: "app.log",
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json(),
      ),
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "debug.log",
      level: "debug",
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "combined.log",
      level: "info",
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.Console({
      level: "info",
      silent: Config.NODE_ENV === "test",
    }),
  ],
});

export default logger;
