class MailRule {
  constructor(object) {
    this.state = object ? object : {};
  }

  static rules() {
    return [
      '',
      'Mittwochs für die nächste Woche',
      'Am 5. den Folgemonat',
      'Am 20. den Folgemonat ab 15.',
      'Montags die Folgewoche ab Freitag',
      'Am 5. zwei Folgemonate'
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

}

module.exports = MailRule;
