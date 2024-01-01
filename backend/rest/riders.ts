import express, { Request, Response } from "express";

import store from "../lib/rider/riderstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { Rider } from "jc-shared/rider/rider.js";
import { checkOrgateam } from "./checkAccessHandlers.js";

const app = express();

app.get("/riders/:url", async (req: Request, res: Response) => {
  const rider = await store.getRider(req.params.url);
  resToJson(res, rider);
});

app.post("/riders", [checkOrgateam], async (req: Request, res: Response) => {
  if (req.body) {
    const rider = new Rider(req.body);
    store.saveRider(rider);
    return resToJson(res, rider);
  }
});

export default app;
