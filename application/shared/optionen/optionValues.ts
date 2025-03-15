import remove from "lodash/remove.js";
import sortBy from "lodash/fp/sortBy.js";
import toLower from "lodash/fp/toLower.js";
import misc from "../commons/misc.js";
import find from "lodash/find.js";

import Kontakt from "../veranstaltung/kontakt.js";
import map from "lodash/map.js";
import forEach from "lodash/forEach.js";

const sortByNameCaseInsensitive = sortBy(toLower);

export type Hotelpreise = {
  name: string;
  einzelEUR: number;
  doppelEUR: number;
  suiteEUR: number;
};

export type TypMitMehr = {
  [index: string]: boolean;
  kasse: boolean;
  kasseV: boolean;
  techniker: boolean;
  technikerV: boolean;
  mod: boolean;
  merchandise: boolean;
} & {
  name: string;
  color: string;
};

export const colorDefault = "#6c757d";
export const colorVermietung = "#f6eee1";

export type Preisprofil = {
  name: string;
  regulaer: number;
  rabattErmaessigt: number;
  rabattMitglied: number;
  veraltet?: boolean;
};

function preisprofileInitial(): Preisprofil[] {
  return [
    {
      name: "Kooperation",
      regulaer: 0,
      rabattErmaessigt: 0,
      rabattMitglied: 0,
    },
    {
      name: "Freier Eintritt",
      regulaer: 0,
      rabattErmaessigt: 0,
      rabattMitglied: 0,
    },
    { name: "Classix", regulaer: 5, rabattErmaessigt: 1, rabattMitglied: 5 },
    { name: "6,00", regulaer: 6, rabattErmaessigt: 1, rabattMitglied: 2 },
    { name: "8,00", regulaer: 8, rabattErmaessigt: 2, rabattMitglied: 4 },
    { name: "10,00", regulaer: 10, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "12,00", regulaer: 12, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "12,00 fest", regulaer: 12, rabattErmaessigt: 0, rabattMitglied: 0 },
    { name: "15,00", regulaer: 15, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "18,00", regulaer: 18, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "20,00", regulaer: 20, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "22,00", regulaer: 22, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "25,00", regulaer: 25, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "26,00", regulaer: 26, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "30,00", regulaer: 30, rabattErmaessigt: 3, rabattMitglied: 7 },
    { name: "34,00", regulaer: 34, rabattErmaessigt: 3, rabattMitglied: 7 },
    { name: "42,00", regulaer: 42, rabattErmaessigt: 3, rabattMitglied: 7 },
    { name: "35,00", regulaer: 35, rabattErmaessigt: 2, rabattMitglied: 5 },
    { name: "38,00", regulaer: 38, rabattErmaessigt: 3, rabattMitglied: 7 },
  ];
}

function sortKontakte(kontakte?: Kontakt[]) {
  if (!kontakte) {
    return [];
  }
  return map(kontakte, (kontakt: Kontakt) => new Kontakt(kontakt)).sort((a: Kontakt, b: Kontakt) =>
    a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()),
  );
}

export default class OptionValues {
  id = "instance";
  hotelpreise: Hotelpreise[] = [];
  genres: string[] = [];
  typenPlus: TypMitMehr[] = [];
  kooperationen: string[] = [];
  backlineJazzclub: string[] = [];
  backlineRockshop: string[] = [];
  artists: string[] = [];
  agenturen: Kontakt[] = [];
  hotels: Kontakt[] = [];
  preisprofile: Preisprofil[] = [];
  preisKlavierstimmer = 125;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(object?: any): OptionValues {
    return new OptionValues(object);
  }

  toJSON(): object {
    return Object.assign({}, this);
  }

  constructor(object?: Partial<OptionValues>) {
    if (object) {
      Object.assign(this, object, {
        kooperationen: sortByNameCaseInsensitive(object.kooperationen || []),
        genres: sortByNameCaseInsensitive(object.genres || []),
        backlineJazzclub: sortByNameCaseInsensitive(object.backlineJazzclub || []),
        backlineRockshop: sortByNameCaseInsensitive(object.backlineRockshop || []),
        artists: sortByNameCaseInsensitive(object.artists || []),
        preisprofile: (object.preisprofile || preisprofileInitial()).sort((a: Preisprofil, b: Preisprofil) => {
          if (a.regulaer === b.regulaer) {
            return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
          }
          return a.regulaer > b.regulaer ? 1 : -1;
        }),
        typenPlus: (object.typenPlus ?? []).sort((a: TypMitMehr, b: TypMitMehr) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()),
        ),
        agenturen: sortKontakte(object.agenturen),
        hotels: sortKontakte(object.hotels),
      });
    }
  }

  addOrUpdateKontakt(kontaktKey: "agenturen" | "hotels", kontakt: Kontakt, selection: string): void {
    if (!(selection || "[temporär]").match(/\[temporär]/)) {
      const ourCollection = kontaktKey === "agenturen" ? this.agenturen : this.hotels;
      remove(ourCollection, (k) => k.name === kontakt.name);
      ourCollection.push(kontakt);
    }
  }

  updateHotelpreise(hotel: Kontakt, zimmerPreise: { einzelEUR: number; doppelEUR: number; suiteEUR: number }): void {
    if (find(this.hotels, { name: hotel.name })) {
      remove(this.hotelpreise, (p: Hotelpreise) => p.name === hotel.name);
      this.hotelpreise.push({ name: hotel.name, ...zimmerPreise });
    }
  }

  updateBackline(backlineKey: "Jazzclub" | "Rockshop", backline: string[]): void {
    const key = backlineKey === "Jazzclub" ? "backlineJazzclub" : "backlineRockshop";
    this.updateCollection(key, backline);
  }

  updateCollection(key: "backlineJazzclub" | "backlineRockshop" | "artists", updatedCollection: string | string[]): void {
    const ourCollection = this[key];
    forEach(misc.toArray(updatedCollection), (item) => {
      if (!ourCollection.includes(item)) {
        ourCollection.push(item);
      }
    });
  }
}
