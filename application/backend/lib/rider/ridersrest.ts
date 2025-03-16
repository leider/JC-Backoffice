import express, { Request, Response } from "express";

import store from "./riderstore.js";
import { resToJson } from "../commons/replies.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import User from "jc-shared/user/user.js";

const app = express();

app.get("/:url", (req: Request, res: Response) => {
  const rider = store.getRider(req.params.url);
  if (!rider || DatumUhrzeit.forJSDate(rider?.startDate).istVorOderAn(new DatumUhrzeit())) {
    res.sendStatus(403);
    return;
  }
  resToJson(res, rider);
});

app.post("/", (req: Request, res: Response) => {
  if (req.body) {
    const rider = store.getRider(req.body.id);
    if (rider) {
      if (DatumUhrzeit.forJSDate(rider?.startDate).istNach(new DatumUhrzeit())) {
        rider.boxes = req.body.boxes;
      }
      const anonymous = new User({ id: "anonymous", name: "Rider Anonymous" });
      store.saveRider(rider, anonymous);
      resToJson(res, rider);
      return;
    }
  }
  res.sendStatus(500);
});

export default app;
