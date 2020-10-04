import misc from "../commons/misc";
import service from "./usersService";
import store from "./userstore";
import Message from "../mailsender/message";
import mailtransport from "../mailsender/mailtransport";
import statusmessage from "../commons/statusmessage";
import Users, { Mailingliste } from "./users";
import User from "./user";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

app.get("/rundmail", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  store.allUsers((err: Error | null, users: User[]) => {
    const listen = new Users(users).mailinglisten;
    res.render("rundmail", { listen, users: users.filter((user) => !!user.email) });
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
    const validUsers = new Users(users).filterReceivers(req.body.group, req.body.user, req.body.liste).filter((user) => !!user.email);
    const emails = validUsers.map((user) => Message.formatEMailAddress(user.name, user.email));
    const markdownToSend = req.body.markdown;
    const currentUser = users.find((user) => user.id === (req.user as User).id);
    if (!validUsers || !currentUser) {
      return next(new Error("Fehler beim Senden"));
    }
    const message = new Message(
      {
        subject: req.body.subject,
        markdown: markdownToSend,
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
    res.render("mailingliste", { listen, users: users.filter((user) => !!user.email) });
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
    users.forEach((u) => u.unsubscribeFromList(oldlistname));
    const selectedUsers = users.filter((u) => usernames.includes(u.id));
    selectedUsers.forEach((u) => u.subscribeList(listname));
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
    users.forEach((u) => u.unsubscribeFromList(listname));
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

app.post("/deleteUser", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.isSuperuser()) {
    return;
  }
  store.deleteUser(user.id, (err: Error, message: string) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send({ message });
  });
});

export default app;
