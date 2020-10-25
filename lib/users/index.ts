import service from "./usersService";
import store from "./userstore";
import Users, { Mailingliste } from "./users";
import User from "./user";
import { expressAppIn } from "../middleware/expressViewHelper";
import Message from "../mailsender/message";
import mailtransport from "../mailsender/mailtransport";

const app = expressAppIn(__dirname);

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

app.post("/saveNewUser", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.isSuperuser()) {
    return;
  }
  service.saveNewUserWithPassword(user, (err: Error, message: string) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send({ message });
  });
});

app.post("/changePassword", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.canEditUser(user.id)) {
    return;
  }
  service.changePassword(user, (err: Error, message: string) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send({ message });
  });
});

app.post("/deleteUser", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return;
  }
  const user = new User(req.body);
  store.deleteUser(user.id, (err: Error, message: string) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send({ message });
  });
});

// Mailinglisten und Senden

app.get("/mailinglists.json", (req, res, next) => {
  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    const listen = new Users(users).mailinglisten;
    res.render("mailingliste", { listen, users: users.filter((user) => !!user.email) });
  });
});

app.post("/rundmail", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return;
  }
  const message = Message.fromJSON(req.body);
  return mailtransport.sendMail(message, (err: Error | null) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send({ message: "Deine Mail wurde geschickt." });
  });
});

app.post("/deleteliste", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  const listname = req.body.name;

  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    users.forEach((u) => u.unsubscribeFromList(listname));
    store.saveAll(users, (err1: Error | null) => {
      if (err1) {
        return res.status(500).send(err1);
      }
      res.set("Content-Type", "application/json").send({ message: "Löschen erfolgreich" });
    });
  });
});

app.post("/saveliste", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  const list = new Mailingliste(req.body.name, req.body.users, req.body.originalName);
  store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    users.forEach((u) => u.unsubscribeFromList(list.originalName));
    const selectedUsers = users.filter((u) => list.users.map((lu) => lu.id).includes(u.id));
    selectedUsers.forEach((u) => u.subscribeList(list.name));
    store.saveAll(users, (err1: Error | null) => {
      if (err1) {
        return res.status(500).send(err1);
      }
      res.set("Content-Type", "application/json").send({ message: "Speichern erfolgreich" });
    });
  });
});

export default app;
