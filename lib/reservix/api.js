const request = require('request').defaults({encoding: null});
const baseurl = 'https://api.reservix.de/1/';

const apiKey = 'api-key=' + require('simple-configure').get('reservixKey');

function callUrl(url, callback) {
  request.get(url, (error, response, body) => {
    if (error) {
      return callback();
    }
    const result = JSON.parse(new Buffer(body).toString());
    callback(result);
  });
}

function allEvents(callback) {
  callUrl(baseurl + 'sale/event?' + apiKey, callback);
}

function salesreport(eventID, callback) {
  callUrl(baseurl + 'sale/event/' + eventID + '/salesreport/?startdate=1800-01-01&' + apiKey, callback);
}

module.exports = {
  allEvents,
  salesreport
};
