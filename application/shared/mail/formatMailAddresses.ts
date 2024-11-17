import { MailAddress } from "./mailMessage.js";

export default function formatMailAddresses(addresses: MailAddress[]) {
  return addresses.map(({ name, address }) => {
    return `"${name}" <${address}>`;
  });
}
