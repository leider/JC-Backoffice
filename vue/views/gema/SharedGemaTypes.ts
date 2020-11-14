import DatumUhrzeit from "../../../backend/lib/commons/DatumUhrzeit";

export interface VeranstaltungZeileMitCheck {
  id: string;
  description: string;
  startDatumUhrzeit: DatumUhrzeit;
  selected: boolean;
}

export type vorNach = "vergangene" | "zukuenftige";
export type renderart = "PDF" | "CSV";

export interface TransferObject {
  selectedIds: string[];
  renderart: renderart;
  vorNach: vorNach;
}
