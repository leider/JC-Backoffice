process.chdir(__dirname);
const Beans = require('CoolBeans');
const conf = require('simple-configure');
const path = require('path');

function createConfiguration() {
  const configdir = path.join(__dirname, '/config/');

  // first, set the default values
  conf.addProperties({
    port: '1969',
    beans: new Beans(configdir + 'beans.json'),
    emaildomainname: 'localhost'
  });

  // then, add properties from config files:
  const files = [
    'mailsender-config.json',
    'mongo-config.json',
    'passwordSalt.json',
    'server-config.json'
  ];
  conf.addFiles(files.map(file => configdir + file));

  return conf;
}

module.exports = createConfiguration();
