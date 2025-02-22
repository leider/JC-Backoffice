import express, { Request, Response } from "express";

import store from "../lib/rider/riderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { Rider } from "jc-shared/rider/rider.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import User from "jc-shared/user/user.js";
import { areDifferent } from "jc-shared/commons/comparingAndTransforming.js";

const app = express();

app.get("/riders/:url", (req: Request, res: Response) => {
  resToJson(res, store.getRider(req.params.url) ?? {});
});

app.post("/riders", [checkOrgateam], (req: Request, res: Response) => {
  if (req.body) {
    const prevRider = store.getRider(req.body.id) ?? undefined;
    const rider = new Rider(req.body);
    if ((!prevRider && rider.boxes.length === 0) || !areDifferent(rider, prevRider)) {
      resToJson(res, req.body);
      return;
    }
    store.saveRider(rider, req.user as User);
    resToJson(res, rider);
  }
  resToJson(res, {});
});

export default app;
