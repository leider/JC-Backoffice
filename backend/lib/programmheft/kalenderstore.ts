import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender from "jc-shared/programmheft/kalender";

import pers from "../persistence/persistenceNew";

const persistence = pers("kalenderstore");

export default {
  getKalender: async function getKalender(id: string) {
    const result = await persistence.getById(id);
    return new Kalender(result as any);
  },

  saveKalender: async function saveKalender(kalender: Kalender) {
    return persistence.save(kalender);
  },

  getCurrentKalender: async function getCurrentKalender(aDatumUhrzeit: DatumUhrzeit) {
    return this.getKalender(aDatumUhrzeit.vorigerOderAktuellerUngeraderMonat.fuerKalenderViews);
  },

  getNextKalender: async function getNextKalender(aDatumUhrzeit: DatumUhrzeit) {
    return this.getKalender(aDatumUhrzeit.naechsterUngeraderMonat.fuerKalenderViews);
  },
};
