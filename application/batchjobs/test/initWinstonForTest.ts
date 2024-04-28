import { loggers, transports } from "winston";

function console() {
  return new transports.Console();
}

loggers.add("application", { level: "error", transports: [console()] });
loggers.add("scripts", { level: "error", transports: [console()] });
loggers.add("transactions", { level: "error", transports: [console()] });
loggers.add("http", { level: "error", transports: [console()] });

export default loggers;
