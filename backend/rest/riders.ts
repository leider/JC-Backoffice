import express, { Request, Response } from "express";

import store from "../lib/rider/riderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import User from "jc-shared/user/user.js";
import { Rider } from "jc-shared/rider/rider.js";

const app = express();

app.get("/riders/:url", async (req: Request, res: Response) => {
  const rider = await store.getRider(req.params.url);
  resToJson(res, rider);
});

app.post("/riders", async (req: Request, res: Response) => {
  const user = req.user as User;
  if (user && !user?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  if (req.body) {
    const rider = new Rider(req.body);
    store.saveRider(rider);
    return resToJson(res, rider);
  }
});

export default app;
