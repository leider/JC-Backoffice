import { Response } from "express";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reply(res: Response, err?: Error | null, value?: any): void {
  if (err) {
    res.status(500).send(err.message ? err.message : err);
    return;
  }
  const valToSend = value?.toJSON ? value.toJSON() : value;
  res.type("application/json").send(valToSend || { status: "ok" });
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function resToJson(res: Response, value?: any) {
  const valToSend = value?.toJSON ? value.toJSON() : value;
  res.type("application/json").send(valToSend ?? { status: "ok" });
}
