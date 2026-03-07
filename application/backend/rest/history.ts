import express, { Request, Response } from "express";
import { resToJson } from "../lib/commons/replies.js";
import { loadHistoryRows, loadLatestChangedObjectsOverview } from "../lib/history/historyService.js";

const app = express();

app.get("/history/:collection/:id", (req: Request, res: Response) => {
  const collection = req.params.collection as string;
  const id = req.params.id as string;
  const result = loadHistoryRows({ collection, id });
  resToJson(res, result);
});

app.get("/history/:collection", (req: Request, res: Response) => {
  const collection = req.params.collection as string;
  const result = loadLatestChangedObjectsOverview({ collection });
  resToJson(res, result);
});

export default app;
