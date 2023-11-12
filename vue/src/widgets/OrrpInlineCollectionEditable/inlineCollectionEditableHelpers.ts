import { initialSpan } from "./collectionHelpers";
import { CollectionColDesc } from "./types";

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

export function createKey(desc: CollectionColDesc, outerKey: number) {
  return desc.fieldName === "literal" ? outerKey : `${outerKey}-${desc.fieldName}`;
}
