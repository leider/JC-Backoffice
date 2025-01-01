import kalendereventstore from "./kalendereventstore.js";
import { Ical, KalenderEvents } from "jc-shared/optionen/ferienIcals.js";
import superagent from "superagent";

async function retrieveEvents(ical: Ical) {
  const result = kalendereventstore.getKalenderEvents(ical.url);
  if (!result) {
    try {
      const resp = await superagent.get(ical.url);
      kalendereventstore.save(new KalenderEvents({ id: ical.url, content: resp.text, updatedAt: new Date() }));
      return resp.text;
    } catch {
      return undefined;
    }
  }
  const now = Date.now();
  const lastUpdated = result?.updatedAt?.getTime() ?? 0;
  if (now - lastUpdated > 24 * 60 * 60 * 1000) {
    const resp = await superagent.get(ical.url);
    kalendereventstore.save(new KalenderEvents({ id: ical.url, content: resp.text, updatedAt: new Date() }));
    return resp.text;
  }
  return result.content;
}

export default { retrieveEvents };
