import { format, loggers, transports } from "winston";
import { FileTransportInstance } from "winston/lib/winston/transports";

const consoleformat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.prettyPrint(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

function console() {
  return new transports.Console({ format: consoleformat });
}

const fileformat = format.combine(
  format.timestamp(),
  format.prettyPrint(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

function fileNamed(name: string): FileTransportInstance {
  return new transports.File({
    format: fileformat,
    filename: `../log/${name}.log`,
    maxFiles: 5,
    maxsize: 10485760,
  });
}

loggers.add("application", { level: "info", transports: [console(), fileNamed("server")] });
loggers.add("scripts", { level: "info", transports: [console(), fileNamed("scripts")] });
loggers.add("transactions", { level: "warn", transports: [console(), fileNamed("transactions")] });
loggers.add("http", { level: "warn", transports: [console(), fileNamed("http")] });

export default loggers;
