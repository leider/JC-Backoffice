import store from "./optionenstore";

export default {
  optionen: function optionen(callback: Function): void {
    store.get(callback);
  },

  emailAddresses: function emailAddresses(callback: Function): void {
    store.emailAddresses(callback);
  },

  orte: function orte(callback: Function): void {
    store.orte(callback);
  },

  icals: function icals(callback: Function): void {
    store.icals(callback);
  },
};
