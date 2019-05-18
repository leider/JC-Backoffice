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
      this.state.id = encodeURIComponent(
        this.state.name + this.state.email + this.state.rule
      );
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

  subject(datumUhrzeit) {
    const startAndEnd = this.startAndEndDay(datumUhrzeit);
    const startKW = startAndEnd.start.kw();
    const endKW = startAndEnd.end.kw();
    return '[Jazzclub Karlsruhe] KW ' + startKW + ' bis ' + endKW;
  }

  shouldSendUntil(now, other) {
    let day = now;
    const end = other.plus({ tage: 1 });
    while (day.istVor(end)) {
      if (this.shouldSend(day)) {
        return true;
      }
      day = day.plus({ tage: 1 });
    }
    return false;
  }

  shouldSend(datumUhrzeit) {
    const rule = this.rule();
    const rules = MailRule.rules();
    if (rule === rules[1]) {
      // 'Mittwochs für die nächste Woche'
      return datumUhrzeit.wochentag() === 3;
    }
    if (rule === rules[2] || rule === rules[3]) {
      // 'Am 5. den Folgemonat' oder 'Am 5. zwei Folgemonate'
      return datumUhrzeit.tag() === 5;
    }
    if (rule === rules[4]) {
      // 'Am 16. den Folgemonat ab 15.'
      return datumUhrzeit.tag() === 16;
    }
    if (rule === rules[5] || rule === rules[6]) {
      // 'Montags die Folgewoche ab Freitag' oder 'Montags die übernächste Folgewoche'
      return datumUhrzeit.wochentag() === 1;
    }
    return false;
  }

  startAndEndDay(datumUhrzeit) {
    if (!this.shouldSend(datumUhrzeit)) {
      return { start: datumUhrzeit, end: datumUhrzeit };
    }
    const rule = this.rule();
    const rules = MailRule.rules();
    if (rule === rules[1]) {
      // 'Mittwochs für die nächste Woche'
      return {
        start: datumUhrzeit.plus({ tage: 5 }), // nächster Montag
        end: datumUhrzeit.plus({ tage: 11 }) // übernächster Sonntag
      };
    }
    if (rule === rules[2]) {
      // 'Am 5. den Folgemonat'
      return {
        start: datumUhrzeit.plus({ monate: 1 }).setTag(1),
        end: datumUhrzeit
          .plus({ monate: 2 })
          .setTag(1)
          .minus({ tage: 1 })
      };
    }
    if (rule === rules[3]) {
      // 'Am 5. zwei Folgemonate'
      return {
        start: datumUhrzeit.plus({ monate: 1 }).setTag(1),
        end: datumUhrzeit
          .plus({ monate: 3 })
          .setTag(1)
          .minus({ tage: 1 })
      };
    }
    if (rule === rules[4]) {
      // 'Am 16. den Folgemonat ab 15.'
      return {
        start: datumUhrzeit.plus({ monate: 1 }).setTag(15),
        end: datumUhrzeit.plus({ monate: 2 }).setTag(15)
      };
    }
    if (rule === rules[5]) {
      // 'Montags die Folgewoche ab Freitag'
      return {
        start: datumUhrzeit.plus({ tage: 4 }),
        end: datumUhrzeit.plus({ tage: 11 })
      };
    }
    if (rule === rules[6]) {
      // 'Montags die übernächste Folgewoche'
      return {
        start: datumUhrzeit.plus({ tage: 14 }),
        end: datumUhrzeit.plus({ tage: 21 })
      };
    }
    return { start: datumUhrzeit, end: datumUhrzeit };
  }
}

module.exports = MailRule;
