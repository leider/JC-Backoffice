import { initialSpan } from "./collectionHelpers";
import { CollectionColDesc } from "./types";
import _ from "lodash";

export function calcSpans(allColsWithAction: CollectionColDesc[]) {
  function sum(nums: number[]) {
    return nums.reduce((result, curr) => result + curr, 0);
  }

  const allWidths = allColsWithAction.map(initialSpan);
  const totalWidth = sum(allWidths);
  const relation = totalWidth / 24; //calc relative factor
  const adjustedWidths = allWidths.map((each) => Math.trunc(each / relation));
  const adjustedSum = sum(adjustedWidths) - 24; // see difference
  adjustedWidths[adjustedWidths.length - 1] = adjustedWidths[adjustedWidths.length - 1] - adjustedSum;
  return adjustedWidths;
}

export function adaptTypesOnImport(value: any[], columnDescriptions: CollectionColDesc[]) {
  return value.map((row) => {
    const rowCopy = _.cloneDeep(row);
    const keys = Object.keys(rowCopy);
    keys.forEach((key) => {
      const desc = columnDescriptions.find((colDesc) => colDesc.fieldName === key);
      if (desc && desc.type === "text" && typeof rowCopy[key] !== "string" && rowCopy[key] !== null) {
        rowCopy[key] = "" + rowCopy[key];
      }
    });
    return rowCopy;
  });
}

export function setValueUnder(embeddedArrayPath: string[], value: any[]) {
  return embeddedArrayPath.reduceRight((obj: any, next) => ({ [next]: obj }), value);
}

export function createKey(desc: CollectionColDesc, outerKey: number) {
  return desc.fieldName === "literal" ? outerKey : `${outerKey}-${desc.fieldName}`;
}
