import { Response } from "express";

export function resToJson<T>(res: Response, value?: T) {
  res.json(value);
}
