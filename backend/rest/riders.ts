import express, { Request, Response } from "express";

import store from "../lib/rider/riderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import User from "jc-shared/user/user.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import { Rider } from "jc-shared/rider/rider.js";

const app = express();

app.get("/riders/:url", async (req: Request, res: Response) => {
  const user = req.user as User;
  const rider = await store.getRider(req.params.url);
  if (!user) {
    if (!rider || DatumUhrzeit.forJSDate(rider?.startDate).istNach(new DatumUhrzeit())) {
      return res.sendStatus(403);
    }
  }
  resToJson(res, rider);
});

app.post("/riders", async (req: Request, res: Response) => {
  const user = req.user as User;
  if (user && !user?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  if (req.body) {
    let rider = await store.getRider(req.body.url);
    if (rider) {
      if (!user) {
        if (DatumUhrzeit.forJSDate(rider?.startDate).istVorOderAn(new DatumUhrzeit())) {
          rider.boxes = req.body.boxes;
        }
      }
    } else {
      rider = new Rider(req.body);
    }
    store.saveRider(rider);
    return resToJson(res, rider);
  }
});

export default app;
