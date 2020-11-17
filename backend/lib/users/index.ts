import service from "./usersService";
import store from "./userstore";
import { Mailingliste } from "../../../shared/user/users";
import User from "../../../shared/user/user";
import { expressAppIn } from "../middleware/expressViewHelper";
import Message from "../../../shared/mail/message";
import mailtransport from "../mailsender/mailtransport";
import { reply } from "../commons/replies";

const app = expressAppIn(__dirname);

app.get("/user.json", (req, res) => {
  reply(res, undefined, req.user);
});

app.get("/allusers.json", (req, res) => {
  store.allUsers((err?: Error, users?: User[]) => {
    reply(res, err, { users: users?.map((u) => u.toJSON()) });
  });
});

app.post("/saveUser", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.canEditUser(user.id)) {
    return res.sendStatus(403);
  }
  store.save(user, (err?: Error) => {
    reply(res, err, user);
  });
});

app.post("/saveNewUser", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  service.saveNewUserWithPassword(user, (err?: Error, message?: string) => {
    reply(res, err || new Error(message));
  });
});

app.post("/changePassword", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.canEditUser(user.id)) {
    return res.sendStatus(403);
  }
  service.changePassword(user, (err?: Error, message?: string) => {
    reply(res, err || new Error(message));
  });
});

app.post("/deleteUser", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const user = new User(req.body);
  store.deleteUser(user.id, (err?: Error, message?: string) => {
    reply(res, err || new Error(message));
  });
});

// Mailinglisten und Senden

app.post("/rundmail", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const message = Message.fromJSON(req.body);
  return mailtransport.sendMail(message, (err: Error | null) => {
    reply(res, err);
  });
});

app.post("/deleteliste", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const listname = req.body.name;
  store.allUsers((err?: Error, users?: User[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    users?.forEach((u) => u.unsubscribeFromList(listname));
    store.saveAll(users || [], (err1?: Error) => {
      reply(res, err1);
    });
  });
});

app.post("/saveliste", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const list = new Mailingliste(req.body.name, req.body.users, req.body.originalName);
  store.allUsers((err?: Error, users?: User[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    users?.forEach((u) => u.unsubscribeFromList(list.originalName));
    const selectedUsers = users?.filter((u) => list.users.map((lu) => lu.id).includes(u.id));
    selectedUsers?.forEach((u) => u.subscribeList(list.name));
    store.saveAll(users || [], (err1?: Error) => {
      reply(res, err1);
    });
  });
});

export default app;
