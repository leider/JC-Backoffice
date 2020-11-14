import store from "./optionenstore";

export default {
  optionen: function optionen(callback: Function): void {
    store.get(callback);
  },

  orte: function orte(callback: Function): void {
    store.orte(callback);
  },

  icals: function icals(callback: Function): void {
    store.icals(callback);
  },
};
