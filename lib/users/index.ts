import express from "express";
import misc from "../commons/misc"
import service from "./usersService";
import store from "./userstore";
import Message from "../mailsender/message";
import mailtransport from "../mailsender/mailtransport";
import statusmessage from "../commons/statusmessage";
import Users, { Mailingliste } from "./users";
import User from "./user";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

function showListe(res: express.Response, next: express.NextFunction, optionalLastSavedUser?: User): void {
  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    return res.render("liste", {
      users,
      lastSaved: optionalLastSavedUser
    });
  });
}

app.get("/", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  return showListe(res, next);
});

app.get("/rundmail", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  store.allUsers((err: Error | null, users: User[]) => {
    const listen = new Users(users).mailinglisten;
    res.render("rundmail", { listen, users: users.filter(user => !!user.email) });
  });
});

app.post("/rundmail", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    const validUsers = new Users(users).filterReceivers(req.body.group, req.body.user, req.body.liste).filter(user => !!user.email);
    const emails = validUsers.map(user => Message.formatEMailAddress(user.name, user.email));
    const markdownToSend = req.body.markdown;
    const currentUser = users.find(user => user.id === (req.user as User).id);
    if (!validUsers || !currentUser) {
      return next(new Error("Fehler beim Senden"));
    }
    const message = new Message(
      {
        subject: req.body.subject,
        markdown: markdownToSend
      },
      currentUser.name,
      currentUser.email
    );
    message.setBcc(emails);
    return mailtransport.sendMail(message, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      statusmessage.successMessage("Gesendet", "Deine Mail wurde an geschickt").putIntoSession(req);
      return res.redirect("/users/rundmail");
    });
  });
});

app.get("/mailinglisten", (req, res, next) => {
  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    const listen = new Users(users).mailinglisten;
    listen.push(new Mailingliste("new", []));
    res.render("mailingliste", { listen, users: users.filter(user => !!user.email) });
  });
});

app.post("/mailinglisten", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  const listname = req.body.name;
  const oldlistname = req.body.oldname;
  const usernames = misc.toArray(req.body.users);
  if (listname === "new") {
    return res.redirect("/users/mailinglisten");
  }

  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    users.forEach(u => u.unsubscribeFromList(oldlistname));
    const selectedUsers = users.filter(u => usernames.includes(u.id));
    selectedUsers.forEach(u => u.subscribeList(listname));
    store.saveAll(users, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      res.redirect("/users/mailinglisten");
    });
  });
});

app.get("/deleteliste/:name", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  const listname = req.params.name;
  if (listname === "new") {
    return res.redirect("/users/mailinglisten");
  }

  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    users.forEach(u => u.unsubscribeFromList(listname));
    store.saveAll(users, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      res.redirect("/users/mailinglisten");
    });
  });
});

app.get("/user.json", (req, res) => {
  res.set("Content-Type", "application/json").send((req.user as User)?.toJSON());
});

app.get("/allusers.json", (req, res) => {
  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(users.map((u) => u.toJSON()));
  });
});

app.post("/saveUser", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.canEditUser(user.id)) {
    return;
  }
  store.save(user, (err: Error) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(user.toJSON());
  });
});

app.get("/changePassword/:id", (req, res, next) => {
  if (!res.locals.accessrights.canEditUser(req.params.id) && !res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  return store.forId(req.params.id, (err: Error | null, user: User) => {
    if (err) {
      return next(err);
    }
    return res.render("changePassword", { user: user });
  });
});

app.get("/:id", (req, res, next) => {
  if (!res.locals.accessrights.canEditUser(req.params.id) && !res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  return store.forId(req.params.id, (err: Error | null, user: User) => {
    if (err) {
      return next(err);
    }
    return res.render("edit", { user: user });
  });
});

app.get("/:id/delete", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  return store.deleteUser(req.params.id, (err: Error | null) => {
    if (err) {
      return next(err);
    }
    return res.redirect("/users");
  });
});

app.post("/submit", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser() && !res.locals.accessrights.memberId() === req.body.id) {
    return res.redirect("/");
  }
  const userid = req.body.id;
  return store.forId(userid, (err: Error | null, user: User) => {
    if (err) {
      return next(err);
    }
    user.name = req.body.name;
    user.email = req.body.email;
    user.tel = req.body.tel;
    user.tshirt = req.body.tshirt;
    user.gruppen = misc.toArray(req.body.gruppen);
    user.rechte = misc.toArray(req.body.rechte);
    return store.save(user, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      return showListe(res, next);
    });
  });
});

app.post("/newPassword", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser() && !res.locals.accessrights.memberId() === req.body.id) {
    return res.redirect("/");
  }
  return service.updatePassword(req.body.id, req.body.passwort, (err: Error | null, user: User) => {
    if (err) {
      return next(err);
    }
    return showListe(res, next, user);
  });
});

app.post("/submitNew", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  return service.saveNewUser(req.body.username, (err: Error | null, user: User) => {
    if (err) {
      return next(err);
    }
    return showListe(res, next, user);
  });
});

export default app;
