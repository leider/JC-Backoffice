import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kalender from "jc-shared/programmheft/kalender.js";

import pers from "../persistence/persistence.js";
import misc from "jc-shared/commons/misc.js";

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
