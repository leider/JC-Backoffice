import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kalender from "jc-shared/programmheft/kalender.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import User from "jc-shared/user/user.js";

const persistence = pers("kalenderstore");

export default {
  getKalender: function getKalender(id: string) {
    return misc.toObject<Kalender>(Kalender, persistence.getById(id));
  },

  saveKalender: function saveKalender(kalender: Kalender, user: User) {
    persistence.save(kalender, user);
    return kalender;
  },

  getCurrentKalender: function getCurrentKalender(aDatumUhrzeit: DatumUhrzeit) {
    return this.getKalender(aDatumUhrzeit.vorigerOderAktuellerUngeraderMonat.fuerKalenderViews);
  },

  getNextKalender: function getNextKalender(aDatumUhrzeit: DatumUhrzeit) {
    return this.getKalender(aDatumUhrzeit.naechsterUngeraderMonat.fuerKalenderViews);
  },
};
