import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import { withoutNullOrUndefinedStrippedBy } from "jc-shared/commons/comparingAndTransforming.ts";
import Konzert from "jc-shared/konzert/konzert.ts";

export type TeamFilterObject = {
  istKonzert?: boolean;
  hotelBestaetigt?: boolean;
  presse?: {
    checked?: boolean;
    text?: boolean;
    originalText?: boolean;
  };
  kopf?: {
    confirmed?: boolean;
    abgesagt?: boolean;
    fotografBestellen?: boolean;
    kannAufHomePage?: boolean;
    kannInSocialMedia?: boolean;
  };
  technik?: { checked?: boolean; fluegel?: boolean };
};

function filterPresse(ver: Veranstaltung, filterObj: TeamFilterObject) {
  const filter = filterObj.presse;

  if (isEmpty(filter)) {
    return true;
  }
  if (!ver.brauchtPresse) {
    return false;
  }

  const presse = ver.presse;
  const pred1 = !isNil(filter.checked) ? presse.checked === filter.checked : true;
  const pred2 = !isNil(filter.text) ? (filter.text ? !isEmpty(presse.text) : isEmpty(presse.text)) : true;
  const pred3 = !isNil(filter.originalText) ? (filter.originalText ? !isEmpty(presse.originalText) : isEmpty(presse.originalText)) : true;
  return pred1 && pred2 && pred3;
}

function filterKopf(ver: Veranstaltung, filterObj: TeamFilterObject) {
  const filter = filterObj.kopf;
  if (isEmpty(filter)) {
    return true;
  }
  const kopf = ver.kopf;
  const pred1 = isNil(filter?.confirmed) ? true : kopf.confirmed === filter?.confirmed;
  const pred2 = !isNil(kopf.abgesagt) && !isNil(filter?.abgesagt) ? kopf.abgesagt === filter?.abgesagt : true;
  const pred3 =
    !isNil(kopf.fotografBestellen) && !isNil(filter?.fotografBestellen) ? kopf.fotografBestellen === filter?.fotografBestellen : true;
  const pred4 = !isNil(kopf.kannAufHomePage) && !isNil(filter?.kannAufHomePage) ? kopf.kannAufHomePage === filter?.kannAufHomePage : true;
  const pred5 =
    !isNil(kopf.kannInSocialMedia) && !isNil(filter?.kannInSocialMedia) ? kopf.kannInSocialMedia === filter?.kannInSocialMedia : true;
  return pred1 && pred2 && pred3 && pred4 && pred5;
}

function filterTechnik(ver: Veranstaltung, filterObj: TeamFilterObject) {
  const filter = filterObj.technik;
  if (isEmpty(filter)) {
    return true;
  }
  const technik = ver.technik;
  const pred1 = isNil(filter?.checked) ? true : technik.checked === filter?.checked;
  const pred2 = isNil(filter?.fluegel) ? true : technik.fluegel === filter?.fluegel;
  return pred1 && pred2;
}

function filterUnterkunft(ver: Veranstaltung, filter: TeamFilterObject) {
  if (isEmpty(filter) || isNil(filter.hotelBestaetigt)) {
    return true;
  }
  if (ver.isVermietung || !ver.artist.brauchtHotel) {
    return false;
  }
  return (ver as Konzert).unterkunft.bestaetigt === filter.hotelBestaetigt;
}

export default function applyTeamFilter(filterOri: TeamFilterObject) {
  const filter = withoutNullOrUndefinedStrippedBy(filterOri);
  return (ver: Veranstaltung) => {
    if (!ver || !filter) return true;
    const artFilter = isNil(filter.istKonzert) ? true : ver.isVermietung === !filter.istKonzert;
    return artFilter && filterPresse(ver, filter) && filterKopf(ver, filter) && filterTechnik(ver, filter) && filterUnterkunft(ver, filter);
  };
}
