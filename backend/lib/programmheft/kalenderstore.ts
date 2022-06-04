import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender from "jc-shared/programmheft/kalender";

import pers from "../persistence/persistence";
import misc from "jc-shared/commons/misc";

const persistence = pers("kalenderstore");

export default {
  getKalender: async function getKalender(id: string) {
    const result = await persistence.getById(id);
    return misc.toObject(Kalender, result);
  },

  saveKalender: async function saveKalender(kalender: Kalender) {
    await persistence.save(kalender);
    return kalender;
  },

  getCurrentKalender: async function getCurrentKalender(aDatumUhrzeit: DatumUhrzeit) {
    return this.getKalender(aDatumUhrzeit.vorigerOderAktuellerUngeraderMonat.fuerKalenderViews);
  },

  getNextKalender: async function getNextKalender(aDatumUhrzeit: DatumUhrzeit) {
    return this.getKalender(aDatumUhrzeit.naechsterUngeraderMonat.fuerKalenderViews);
  },
};
