import store from "jc-backend/lib/veranstaltungen/veranstaltungenstore.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import vermietungenstore from "jc-backend/lib/vermietungen/vermietungenstore.js";
import sortBy from "lodash/sortBy.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";

export async function byDateRangeInAscendingOrder({
  from,
  to,
  veranstaltungenFilter,
  vermietungenFilter,
}: {
  from: DatumUhrzeit;
  to: DatumUhrzeit;
  veranstaltungenFilter?: (ver: Veranstaltung) => boolean;
  vermietungenFilter?: (ver: Vermietung) => boolean;
}) {
  const alwaysTrue = () => true;

  const veranstaltungen = await store.byDateRangeInAscendingOrder(from, to);
  const filteredVeranstaltungen = veranstaltungen.filter(veranstaltungenFilter || alwaysTrue);
  const vermietungen = await vermietungenstore.byDateRangeInAscendingOrder(from, to);
  const filteredVermietungen = vermietungen.filter(vermietungenFilter || alwaysTrue);
  return sortBy([...filteredVeranstaltungen, ...filteredVermietungen], "startDate");
}
