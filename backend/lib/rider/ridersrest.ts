import express, { Request, Response } from "express";

import store from "./riderstore.js";
import { resToJson } from "../commons/replies.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import User from "jc-shared/user/user.js";

const app = express();

app.get("/:url", async (req: Request, res: Response) => {
  const rider = await store.getRider(req.params.url);
  if (!rider || DatumUhrzeit.forJSDate(rider?.startDate).istVorOderAn(new DatumUhrzeit())) {
    return res.sendStatus(403);
  }
  resToJson(res, rider);
});

app.post("/", async (req: Request, res: Response) => {
  if (req.body) {
    const rider = await store.getRider(req.body.id);
    if (rider) {
      if (DatumUhrzeit.forJSDate(rider?.startDate).istNach(new DatumUhrzeit())) {
        rider.boxes = req.body.boxes;
      }
      store.saveRider(rider, req.user as User);
      return resToJson(res, rider);
    }
  }
  res.sendStatus(500);
});

export default app;
