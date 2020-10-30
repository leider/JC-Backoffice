import range from "lodash/range";
import remove from "lodash/remove";
import { sortBy, toLower } from "lodash/fp";
import misc from "../commons/misc";
import Kontakt from "../veranstaltungen/object/kontakt";

const sortByNameCaseInsensitive = sortBy(toLower);

export type Hotelpreise = {
  name: string;
  einzelEUR: number;
  doppelEUR: number;
  suiteEUR: number;
};

export type Preisprofil = {
  name: string;
  regulaer: number;
  rabattErmaessigt: number;
  rabattMitglied: number;
};

export default class OptionValues {
  id = "instance";
  hotelpreise: Hotelpreise[] = [];
  genres: string[] = [];
  typen: string[] = [];
  kooperationen: string[] = [];
  backlineJazzclub: string[] = [];
  backlineRockshop: string[] = [];
  artists: string[] = [];
  agenturen: Kontakt[] = [];
  hotels: Kontakt[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(object?: any): OptionValues {
    return new OptionValues(object);
  }

  toJSON(): object {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object) {
      delete object._id;
      Object.assign(this, object, {
        typen: sortByNameCaseInsensitive(object.typen || []),
        kooperationen: sortByNameCaseInsensitive(object.kooperationen || []),
        backlineJazzclub: sortByNameCaseInsensitive(object.backlineJazzclub || []),
        backlineRockshop: sortByNameCaseInsensitive(object.backlineRockshop || []),
        artists: sortByNameCaseInsensitive(object.artists || []),
      });
    }
  }

  preisprofile(): Preisprofil[] {
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
      { name: "15,00", regulaer: 15, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: "18,00", regulaer: 18, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: "22,00", regulaer: 22, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: "26,00", regulaer: 26, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: "30,00", regulaer: 30, rabattErmaessigt: 3, rabattMitglied: 7 },
      { name: "34,00", regulaer: 34, rabattErmaessigt: 3, rabattMitglied: 7 },
      { name: "38,00", regulaer: 38, rabattErmaessigt: 3, rabattMitglied: 7 },
      { name: "42,00", regulaer: 42, rabattErmaessigt: 3, rabattMitglied: 7 },
    ];
  }

  noOfEmails(): number[] {
    return range(1, 16);
  }

  addOrUpdateKontakt(kontaktKey: "agenturen" | "hotels", kontakt: Kontakt, selection: string): void {
    if (!(selection || "[temporär]").match(/\[temporär]/)) {
      const ourCollection = kontaktKey === "agenturen" ? this.agenturen : this.hotels;
      remove(ourCollection, (k) => k.name === kontakt.name);
      ourCollection.push(kontakt);
    }
  }

  updateHotelpreise(hotel: Kontakt, zimmerPreise: { einzelEUR: number; doppelEUR: number; suiteEUR: number }): void {
    if (this.hotels.find((h) => h.name === hotel.name)) {
      remove(this.hotelpreise, (p: Hotelpreise) => p.name === hotel.name);
      this.hotelpreise.push({ name: hotel.name, ...zimmerPreise });
    }
  }

  updateBackline(backlineKey: "Jazzclub" | "Rockshop", backline: string[]): void {
    const key = backlineKey === "Jazzclub" ? "backlineJazzclub" : "backlineRockshop";
    this.updateCollection(key, backline);
  }

  updateCollection(key: "backlineJazzclub" | "backlineRockshop" | "artists", updatedCollection: string | string[]): void {
    let ourCollection: string[];
    switch (key) {
      case "artists":
        if (!this.artists) {
          this.artists = [];
        }
        ourCollection = this.artists;
        break;
      case "backlineJazzclub":
        if (!this.backlineJazzclub) {
          this.backlineJazzclub = [];
        }
        ourCollection = this.backlineJazzclub;
        break;
      case "backlineRockshop":
        if (!this.backlineRockshop) {
          this.backlineRockshop = [];
        }
        ourCollection = this.backlineRockshop;
        break;
    }
    misc.toArray(updatedCollection).forEach((item) => {
      if (ourCollection.indexOf(item) < 0) {
        ourCollection.push(item);
      }
    });
  }
}
