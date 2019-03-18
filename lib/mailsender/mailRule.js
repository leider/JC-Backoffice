class MailRule {
  constructor(object) {
    this.state = object ? object : {};
  }

  static rules() {
    return [
      '',
      'Mittwochs für die nächste Woche',
      'Am 5. den Folgemonat',
      'Am 5. zwei Folgemonate',
      'Am 16. den Folgemonat ab 15.',
      'Montags die Folgewoche ab Freitag',
      'Montags die übernächste Folgewoche'
    ];
  }

  fillFromUI(object) {
    ['id', 'name', 'email', 'rule'].forEach(field => {
      this.state[field] = object[field];
    });
    if (!this.state.id) {
      this.state.id = encodeURIComponent(this.state.name + this.state.email + this.state.rule);
    }
    return this;
  }

  rules() {
    return MailRule.rules();
  }

  fullyQualifiedUrl() {
    return '/mailsender/' + encodeURIComponent(this.id());
  }

  id() {
    return this.state.id;
  }

  name() {
    return this.state.name || '';
  }

  email() {
    return this.state.email;
  }

  rule() {
    return this.state.rule;
  }

  markdown() {
    return '### Automatischer Mailversand des Jazzclub Karlruhe e.V.\n'
      + 'Diese Mail ist automatisch generiert. Bitte informieren Sie uns über Verbesserungen oder Änderungswünsche, speziell bzgl. des Sendedatums, der Sendeperiode und des Anfangs- und Endezeitraums.\n\n'
      + 'Liebe Grüße vom Jazzclub Team.';
  }

  subject(dateAsMoment) {
    const startAndEnd = this.startAndEndDay(dateAsMoment);
    const startKW = startAndEnd.start.format('ww');
    const endKW = startAndEnd.end.format('ww');
    return '[Jazzclub Karlsruhe] KW ' + startKW + ' bis ' + endKW;
  }

  shouldSendUntil(now, other) {
    const day = now;
    const end = other.add(1, 'days');
    while (day.isBefore(end)) {
      if (this.shouldSend(day)) {
        return true;
      }
      day.add(1, 'days');
    }
    return false;
  }

  shouldSend(dateAsMoment) {
    const rule = this.rule();
    const rules = this.rules();
    if (rule === rules[1]) { // 'Mittwochs für die nächste Woche'
      return dateAsMoment.isoWeekday() === 3;
    }
    if (rule === rules[2] || rule === rules[3]) { // 'Am 5. den Folgemonat' oder 'Am 5. zwei Folgemonate'
      return dateAsMoment.date() === 5;
    }
    if (rule === rules[4]) { // 'Am 16. den Folgemonat ab 15.'
      return dateAsMoment.date() === 16;
    }
    if (rule === rules[5] || rule === rules[6]) { // 'Montags die Folgewoche ab Freitag' oder 'Montags die übernächste Folgewoche'
      return dateAsMoment.isoWeekday() === 1;
    }
    return false;
  }

  startAndEndDay(dateAsMoment) {
    const start = dateAsMoment.clone();
    const end = dateAsMoment.clone();
    if (!this.shouldSend(dateAsMoment)) {
      return {start, end};
    }
    const rule = this.rule();
    const rules = this.rules();
    if (rule === rules[1]) { // 'Mittwochs für die nächste Woche'
      start.add(5, 'days'); // nächster Montag
      end.add(11, 'days'); // übernächster Sonntag
    }
    if (rule === rules[2]) { // 'Am 5. den Folgemonat'
      start.add(1, 'month').date(1);
      end.add(2, 'month').date(1).subtract(1, 'days');
    }
    if (rule === rules[3]) { // 'Am 5. zwei Folgemonate'
      start.add(1, 'month').date(1);
      end.add(3, 'month').date(1).subtract(1, 'days');
    }
    if (rule === rules[4]) { // 'Am 16. den Folgemonat ab 15.'
      start.add(1, 'month').date(15);
      end.add(2, 'month').date(15);
    }
    if (rule === rules[5]) { // 'Montags die Folgewoche ab Freitag'
      start.add(4, 'days');
      end.add(11, 'days');
    }
    if (rule === rules[6]) { // 'Montags die übernächste Folgewoche'
      start.add(14, 'days');
      end.add(21, 'days');
    }
    return {start, end};
  }
}

module.exports = MailRule;
