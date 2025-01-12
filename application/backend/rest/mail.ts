import express, { Request, Response } from "express";
import { Mailingliste } from "jc-shared/user/users.js";

import mailstore from "../lib/mailsender/mailstore.js";
import MailRule from "jc-shared/mail/mailRule.js";
import { resToJson } from "../lib/commons/replies.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import userstore from "../lib/users/userstore.js";
import misc from "jc-shared/commons/misc.js";
import { calculateChangedAndDeleted } from "jc-shared/commons/compareObjects.js";
import { checkSuperuser } from "./checkAccessHandlers.js";
import User from "jc-shared/user/user.js";
import fs from "fs/promises";
import parseFormData from "../lib/commons/parseFormData.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import invokeMap from "lodash/invokeMap.js";
import map from "lodash/map.js";

const app = express();

app.get("/mailrule", [checkSuperuser], (req: Request, res: Response) => {
  const rules = mailstore.all();
  const result = invokeMap(rules, "toJSON");
  resToJson(res, result);
});

app.post("/mailrules", [checkSuperuser], (req: Request, res: Response) => {
  const oldRules = mailstore.all();
  const newRules = misc.toObjectList(MailRule, req.body);
  const { changed, deletedIds } = calculateChangedAndDeleted(invokeMap(newRules, "toJSON"), invokeMap(oldRules, "toJSON"));

  mailstore.saveAll(changed, req.user as User);
  mailstore.removeAll(deletedIds, req.user as User);
  resToJson(res, mailstore.all());
});

// Mailinglisten und Senden

app.post("/rundmail", [checkSuperuser], async (req: Request, res: Response) => {
  const [fields, files] = await parseFormData(req);
  const user = req.user as User;

  const message = MailMessage.forJsonAndUser(JSON.parse(fields.message[0]), user);
  if (files.dateien) {
    message.attachments = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map(files.dateien, async (datei: any) => {
        const content = await fs.readFile(datei.path);
        const filename = datei.originalFilename.replace(/[()/]/g, "_");
        return { filename, content };
      }),
    );
  }
  const result = await mailtransport.sendMail(message);
  resToJson(res, result);
});

app.post("/mailinglisten", [checkSuperuser], (req: Request, res: Response) => {
  const users = userstore.allUsers();
  const newLists = req.body as Mailingliste[];

  users?.forEach((u) => (u.mailinglisten = []));

  newLists.forEach((list) => {
    const selectedUsers = users?.filter((u) => list.users.includes(u.id));
    selectedUsers?.forEach((u) => u.subscribeList(list.name));
  });

  userstore.saveAll(users || [], req.user as User);
  resToJson(res, users);
});

export default app;
