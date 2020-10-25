import mailstore from "./mailstore";

import MailRule from "./mailRule";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

app.get("/rules.json", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  return mailstore.all((err: Error | null, rules: MailRule[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(rules.map((r) => r.toJSON()));
  });
});

app.post("/saveRule", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  const ruleToSave = new MailRule(req.body);
  mailstore.save(ruleToSave, (err1: Error | null) => {
    if (err1) {
      return res.status(500).send(err1);
    }
    res.set("Content-Type", "application/json").send({ message: "Regel gespeichert." });
  });
});

app.post("/deleteRule", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  mailstore.removeById(req.body.id, (err1: Error | null) => {
    if (err1) {
      return res.status(500).send(err1);
    }
    res.set("Content-Type", "application/json").send({ message: "Regel gelöscht." });
  });
});

export default app;
