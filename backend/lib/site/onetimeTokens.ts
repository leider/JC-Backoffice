import { v4 as uuidv4 } from "uuid";
import { Payload } from "../../../shared/commons/misc";

// This module offers the feature to call e.g. pdf-rendering functions with jwt-security (GET)
// Just request a one time token and send it to the rendering call as payload

const onetimeTokens: { [key: string]: Payload } = {};

export function addPayload(payload: Payload): string {
  const token = uuidv4();
  onetimeTokens[token] = payload;
  return token;
}

export function getPayload(token: string): Payload {
  const payload = onetimeTokens[token];
  delete onetimeTokens[token];
  return payload;
}
