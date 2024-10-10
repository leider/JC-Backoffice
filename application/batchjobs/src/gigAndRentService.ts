import konzertestore from "jc-backend/lib/konzerte/konzertestore.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import vermietungenstore from "jc-backend/lib/vermietungen/vermietungenstore.js";
import sortBy from "lodash/sortBy.js";
import Konzert from "jc-shared/konzert/konzert.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";

export function byDateRangeInAscendingOrder({
  from,
  to,
  konzerteFilter,
  vermietungenFilter,
}: {
  from: DatumUhrzeit;
  to: DatumUhrzeit;
  // eslint-disable-next-line no-unused-vars
  konzerteFilter?: (ver: Konzert) => boolean;
  // eslint-disable-next-line no-unused-vars
  vermietungenFilter?: (ver: Vermietung) => boolean;
}) {
  const alwaysTrue = () => true;

  const konzerte = konzertestore.byDateRangeInAscendingOrder(from, to);
  const filteredKonzerte = konzerte.filter(konzerteFilter ?? alwaysTrue);
  const vermietungen = vermietungenstore.byDateRangeInAscendingOrder(from, to);
  const filteredVermietungen = vermietungen.filter(vermietungenFilter ?? alwaysTrue);
  return sortBy([...filteredKonzerte, ...filteredVermietungen], "startDate");
}
