import konzertestore from "../lib/konzerte/konzertestore.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import vermietungenstore from "../lib/vermietungen/vermietungenstore.js";
import sortBy from "lodash/sortBy.js";
import Konzert from "jc-shared/konzert/konzert.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import constant from "lodash/constant.js";
import filter from "lodash/filter.js";

export function byDateRangeInAscendingOrder({
  from,
  to,
  konzerteFilter,
  vermietungenFilter,
}: {
  from: DatumUhrzeit;
  to: DatumUhrzeit;
  konzerteFilter?: (ver: Konzert) => boolean;
  vermietungenFilter?: (ver: Vermietung) => boolean;
}) {
  const alwaysTrue = constant(true);

  const konzerte = konzertestore.byDateRangeInAscendingOrder(from, to);
  const filteredKonzerte = filter(konzerte, konzerteFilter ?? alwaysTrue);
  const vermietungen = vermietungenstore.byDateRangeInAscendingOrder(from, to);
  const filteredVermietungen = filter(vermietungen, vermietungenFilter ?? alwaysTrue);
  return sortBy([...filteredKonzerte, ...filteredVermietungen], "startDate");
}
