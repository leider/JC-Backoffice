import { v4 as uuidv4 } from "uuid";
import { Payload } from "jc-shared/commons/misc";

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
