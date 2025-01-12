import { MailAddress } from "./mailMessage.js";
import map from "lodash/map.js";

export default function formatMailAddresses(addresses: MailAddress[]) {
  return map(addresses, ({ name, address }) => `"${name}" <${address}>`);
}
