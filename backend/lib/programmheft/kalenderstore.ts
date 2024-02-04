import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kalender from "jc-shared/programmheft/kalender.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";

const persistence = pers("kalenderstore");

export default {
  getKalender: function getKalender(id: string) {
    const result = persistence.getById(id);
    return misc.toObject(Kalender, result);
  },

  saveKalender: function saveKalender(kalender: Kalender) {
    persistence.save(kalender);
    return kalender;
  },

  getCurrentKalender: function getCurrentKalender(aDatumUhrzeit: DatumUhrzeit) {
    return this.getKalender(aDatumUhrzeit.vorigerOderAktuellerUngeraderMonat.fuerKalenderViews);
  },

  getNextKalender: function getNextKalender(aDatumUhrzeit: DatumUhrzeit) {
    return this.getKalender(aDatumUhrzeit.naechsterUngeraderMonat.fuerKalenderViews);
  },
};
