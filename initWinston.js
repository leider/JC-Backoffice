const {format, loggers, transports} = require('winston');

function console() {
  const consoleformat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  );

  return new transports.Console({format: consoleformat});
}

function fileNamed(name) {
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

loggers.add('application', {
    level: 'info',
    transports: [
      console(),
      fileNamed('server')
    ]
  }
);
loggers.add('scripts', {
    level: 'info',
    transports: [
      console(),
      fileNamed('scripts')
    ]
  }
);
loggers.add('transactions', {
    level: 'info',
    transports: [
      console(),
      fileNamed('transactions')
    ]
  }
);
loggers.add('http', {
    level: 'warn',
    transports: [
      console(),
      fileNamed('http')
    ]
  }
);
