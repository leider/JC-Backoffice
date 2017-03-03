'use strict';
process.chdir(__dirname);
const Beans = require('CoolBeans');
const conf = require('simple-configure');
const path = require('path');

const moment = require('moment-timezone');
moment.locale('de');

function createConfiguration() {
  const configdir = path.join(__dirname, '/config/');

  // first, set the default values
  conf.addProperties({
    adminListName: 'admins',
    port: '1969',
    mongoURL: 'mongodb://localhost:27017/swk',
    publicUrlPrefix: 'http://localhost:17124',
    securedByLoginURLPattern: '/activityresults|' +
    '/gallery|' +
    '/mailsender|' +
    '/members|' +
    '/new|' +
    '/edit|' +
    '/submit|' +
    '/subscribe|' +
    '/mailarchive|' +
    '/invitation|' +
    '/addToWaitinglist|' +
    '/addon|' +
    '/submitAddon|' +
    '/wiki/socrates.*/|' +
    '/payment|' +
    'dashboard',
    securedBySuperuserURLPattern: '^\/administration\/',
    secret: 'secret',
    sessionkey: 'softwerkskammer.org',
    beans: new Beans(configdir + 'beans.json'),
    emaildomainname: 'localhost',
    softwerkskammerURL: 'http://localhost:17124',
    socratesURL: 'http://localhost:17224',
    jwtSecret: 'my_very_secret',
    reservedActivityURLs: '^socrates-|^gdcr$|^upcoming$|^past$|^ical$|^eventsForSidebar$|^new$|^newLike$|^edit$|^submit$|^checkurl$|^subscribe$|^unsubscribe$|^addToWaitinglist$|^removeFromWaitinglist$|\\+'

  });

  // then, add properties from config files:
  const files = ['mongo-config.json',
    'passwordSalt.json'];
  conf.addFiles(files.map(file => configdir + file));

  return conf;
}
module.exports = createConfiguration();

