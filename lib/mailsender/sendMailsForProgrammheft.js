const config = require('simple-configure');
const beans = config.get('beans');
const moment = require('moment-timezone');
const async = require('async');

const store = beans.get('kalenderstore');
const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');

function remindForProgrammheft(callback) {
  function sendMail(eventsForToday, callbackInner) {
    const messages = eventsForToday.map(e => {
      const message = new Message({subject: 'Programmheft Action Reminder', markdown: e.body()});
      message.setTo([e.email()]);
      return message;
    });
    async.each(messages, mailtransport.sendMail, callbackInner);
  }

  const today = moment();
  async.parallel({
    current: cb1 => store.getCurrentKalender(today, cb1),
    next: cb2 => store.getNextKalender(today, cb2)
  }, (err, result) => {
    if (err) {
      return callback(err);
    }
    const events = [result.current, result.next].reduce((arr, each) => arr.concat(each.eventsToSend(today)), []);
    sendMail(events, callback);
  });
}

module.exports = {
  remindForProgrammheft
};
