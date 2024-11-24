import DatumUhrzeit from "../commons/DatumUhrzeit.js";

type MailRuleUI = {
  id: string;
  name: string;
  email: string;
  rule: string;
};

interface RuleLogic {
  shouldSend(datumUhrzeit: DatumUhrzeit): boolean;
  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit };
}

class RuleLogicEmpty implements RuleLogic {
  shouldSend(): boolean {
    return false;
  }

  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit } {
    return { start: datumUhrzeit, end: datumUhrzeit };
  }
}

class RuleLogic1 implements RuleLogic {
  shouldSend(datumUhrzeit: DatumUhrzeit): boolean {
    return datumUhrzeit.wochentag === 3;
  }

  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit } {
    if (!this.shouldSend(datumUhrzeit)) {
      return { start: datumUhrzeit, end: datumUhrzeit };
    }
    return {
      start: datumUhrzeit.plus({ tage: 5 }), // nächster Montag
      end: datumUhrzeit.plus({ tage: 11 }), // übernächster Sonntag
    };
  }
}

class RuleLogic2 implements RuleLogic {
  shouldSend(datumUhrzeit: DatumUhrzeit): boolean {
    return datumUhrzeit.tag === 5;
  }

  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit } {
    if (!this.shouldSend(datumUhrzeit)) {
      return { start: datumUhrzeit, end: datumUhrzeit };
    }
    return {
      start: datumUhrzeit.plus({ monate: 1 }).setTag(1),
      end: datumUhrzeit.plus({ monate: 2 }).setTag(1).minus({ tage: 1 }),
    };
  }
}

class RuleLogic3 implements RuleLogic {
  shouldSend(datumUhrzeit: DatumUhrzeit): boolean {
    return datumUhrzeit.tag === 5;
  }

  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit } {
    if (!this.shouldSend(datumUhrzeit)) {
      return { start: datumUhrzeit, end: datumUhrzeit };
    }
    return {
      start: datumUhrzeit.plus({ monate: 1 }).setTag(1),
      end: datumUhrzeit.plus({ monate: 3 }).setTag(1).minus({ tage: 1 }),
    };
  }
}

class RuleLogic4 implements RuleLogic {
  shouldSend(datumUhrzeit: DatumUhrzeit): boolean {
    return datumUhrzeit.tag === 16;
  }

  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit } {
    if (!this.shouldSend(datumUhrzeit)) {
      return { start: datumUhrzeit, end: datumUhrzeit };
    }
    return {
      start: datumUhrzeit.plus({ monate: 1 }).setTag(15),
      end: datumUhrzeit.plus({ monate: 2 }).setTag(15),
    };
  }
}

class RuleLogic5 implements RuleLogic {
  shouldSend(datumUhrzeit: DatumUhrzeit): boolean {
    return datumUhrzeit.wochentag === 1;
  }

  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit } {
    if (!this.shouldSend(datumUhrzeit)) {
      return { start: datumUhrzeit, end: datumUhrzeit };
    }
    return {
      start: datumUhrzeit.plus({ tage: 4 }),
      end: datumUhrzeit.plus({ tage: 11 }),
    };
  }
}

class RuleLogic6 implements RuleLogic {
  shouldSend(datumUhrzeit: DatumUhrzeit): boolean {
    return datumUhrzeit.wochentag === 1;
  }

  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit } {
    if (!this.shouldSend(datumUhrzeit)) {
      return { start: datumUhrzeit, end: datumUhrzeit };
    }
    return {
      start: datumUhrzeit.plus({ tage: 14 }),
      end: datumUhrzeit.plus({ tage: 21 }),
    };
  }
}

const logicArray: { [index: string]: RuleLogic } = {
  "": new RuleLogicEmpty(),
  "Mittwochs für die nächste Woche": new RuleLogic1(),
  "Am 5. den Folgemonat": new RuleLogic2(),
  "Am 5. zwei Folgemonate": new RuleLogic3(),
  "Am 16. den Folgemonat ab 15.": new RuleLogic4(),
  "Montags die Folgewoche ab Freitag": new RuleLogic5(),
  "Montags die übernächste Folgewoche": new RuleLogic6(),
};

export const allMailrules: string[] = Object.keys(logicArray);

export default class MailRule {
  id = "";
  name = "";
  email = "";
  rule = "";

  static fromJSON(object: MailRuleUI): MailRule {
    return new MailRule(object);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  constructor(object?: any) {
    if (object) {
      Object.assign(this, object);
    }
    this.updateId();
  }

  updateId() {
    if (!this.id) {
      this.id = encodeURIComponent(this.name + this.email + this.rule);
    }
  }

  rules(): string[] {
    return allMailrules;
  }

  subject(datumUhrzeit: DatumUhrzeit): string {
    const startAndEnd = this.startAndEndDay(datumUhrzeit);
    const startKW = startAndEnd.start.kw;
    const endKW = startAndEnd.end.kw;
    return "[Jazzclub Karlsruhe] KW " + startKW + " bis " + endKW;
  }

  shouldSendUntil(now: DatumUhrzeit, other: DatumUhrzeit): boolean {
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

  logic(): RuleLogic {
    return logicArray[this.rule] || new RuleLogicEmpty();
  }

  shouldSend(datumUhrzeit: DatumUhrzeit): boolean {
    return this.logic().shouldSend(datumUhrzeit);
  }

  startAndEndDay(datumUhrzeit: DatumUhrzeit): { start: DatumUhrzeit; end: DatumUhrzeit } {
    return this.logic().startAndEndDay(datumUhrzeit);
  }
}
