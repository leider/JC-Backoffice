import mailstore from "./mailstore";

import optionenService from "../optionen/optionenService";
import store from "../veranstaltungen/veranstaltungenstore";
import optionenstore from "../optionen/optionenstore";
import conf from "../commons/simpleConfigure";
import MailRule from "./mailRule";
import Message from "./message";
import mailtransport from "./mailtransport";
import EmailAddresses from "../optionen/emailAddresses";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
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

app.get("/compose", (req, res, next) => {
  // LEGACY
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  return optionenService.emailAddresses((err: Error | null, emailAddresses: EmailAddresses) => {
    if (err) {
      return next(err);
    }
    return store.zukuenftige((err1: Error | null, veranstaltungen: Veranstaltung[]) => {
      if (err1) {
        return next(err1);
      }
      return res.render("compose", {
        upcomingEvents: veranstaltungen,
        optionen: emailAddresses,
      });
    });
  });
});

app.get("/emailAddresses", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return optionenService.emailAddresses((err: Error | null, emailAddresses: EmailAddresses) => {
    if (err) {
      return next(err);
    }
    return res.render("emailAddresses", { emailAddresses });
  });
});

app.post("/submitEmailAddresses", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }
  return optionenService.emailAddresses((err: Error | null, emailAddresses: EmailAddresses) => {
    if (err) {
      return next(err);
    }
    emailAddresses.fillFromUI(req.body);
    return optionenstore.save(emailAddresses, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return res.redirect("/mailsender/emailAddresses");
    });
  });
});

app.post("/send", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  if (!req.body.event || !req.body.partner) {
    return res.redirect("/vue/veranstaltungen/zukuenftige");
  }

  return optionenService.emailAddresses((err: Error | null, emailAddresses: EmailAddresses) => {
    if (err) {
      return next(err);
    }

    const emails = Object.keys(req.body.partner).map((address) => {
      const index = address.substring(5, address.length);
      return Message.formatEMailAddress(emailAddresses.partnerForIndex(Number(index)), emailAddresses.emailForIndex(Number(index)));
    });

    return store.zukuenftige((err1: Error | null, veranstaltungen: Veranstaltung[]) => {
      if (err1) {
        return next(err1);
      }
      const event = Object.keys(req.body.event);
      const selected = veranstaltungen.filter((veranst) => event.includes(veranst.id || ""));
      const markdownToSend =
        req.body.markdown +
        "\n\n---\n" +
        selected.map((veranst) => veranst.presseTextForMail(conf.get("publicUrlPrefix") as string)).join("\n\n---\n");
      const message = new Message({
        subject: req.body.subject,
        markdown: markdownToSend,
      });
      message.setTo(emails);
      return mailtransport.sendMail(message, (err2: Error | null) => {
        if (err2) {
          return next(err2);
        }
        return res.redirect("/vue/veranstaltungen/zukuenftige");
      });
    });
  });
});

export default app;
