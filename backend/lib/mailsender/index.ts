import mailstore from "./mailstore";

import MailRule from "./mailRule";
import { expressAppIn } from "../middleware/expressViewHelper";
import { reply } from "../commons/replies";

const app = expressAppIn(__dirname);

app.get("/rules.json", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  return mailstore.all((err?: Error, rules?: MailRule[]) => {
    const result = rules?.map((r) => r.toJSON());
    reply(res, err, result);
  });
});

app.post("/saveRule", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const ruleToSave = new MailRule(req.body);
  mailstore.save(ruleToSave, (err1?: Error) => {
    reply(res, err1, ruleToSave);
  });
});

app.post("/deleteRule", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  mailstore.removeById(req.body.id, (err1?: Error) => {
    reply(res, err1);
  });
});

export default app;
