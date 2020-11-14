import { format, loggers, transports } from "winston";
import { ConsoleTransportInstance, FileTransportInstance } from "winston/lib/winston/transports";

function consoleForWinston(): ConsoleTransportInstance {
  const consoleformat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  );

  return new transports.Console({ format: consoleformat });
}

function fileNamed(name: string): FileTransportInstance {
  const fileformat = format.combine(
    format.timestamp(),
    format.prettyPrint(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  );

  return new transports.File({
    format: fileformat,
    filename: `log/${name}.log`,
    maxFiles: 5,
    maxsize: 10485760
  });
}

loggers.add("application", {
  level: "info",
  transports: [consoleForWinston(), fileNamed("server")]
});
loggers.add("scripts", {
  level: "info",
  transports: [consoleForWinston(), fileNamed("scripts")]
});
loggers.add("transactions", {
  level: "info",
  transports: [consoleForWinston(), fileNamed("transactions")]
});
loggers.add("http", {
  level: "warn",
  transports: [consoleForWinston(), fileNamed("http")]
});

export default loggers;
