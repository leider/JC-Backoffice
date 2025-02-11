import express, { Request, Response } from "express";

import store from "../lib/rider/riderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { Rider } from "jc-shared/rider/rider.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import User from "jc-shared/user/user.js";

const app = express();

app.get("/riders/:url", (req: Request, res: Response) => {
  resToJson(res, store.getRider(req.params.url));
});

app.post("/riders", [checkOrgateam], (req: Request, res: Response) => {
  if (req.body) {
    const rider = new Rider(req.body);
    store.saveRider(rider, req.user as User);
    resToJson(res, rider);
    return;
  }
});

export default app;
