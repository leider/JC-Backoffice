process.chdir(__dirname);
import conf from './lib/commons/simpleConfigure';
import path from 'path';

function createConfiguration() {
  const configdir = path.join(__dirname, 'config/');

  // first, set the default values
  conf.addProperties({
    'port': '1969',
    'emaildomainname': 'localhost'
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
