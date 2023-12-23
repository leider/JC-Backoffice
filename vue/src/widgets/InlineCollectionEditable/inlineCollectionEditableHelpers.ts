import { CollectionColDesc, CollectionHeight } from "./types";

export function initialSpan(desc: CollectionColDesc) {
  return { xs: 3, s: 4, m: 6, l: 8, xl: 12 }[desc.width];
}

export function getCollectionHeightsInPixel(height: CollectionHeight) {
  return { xs: 160, sm: 240, md: 360, lg: 560, xl: 760 }[height];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addInitialValueFromObjectToColDescs(colDesc: CollectionColDesc[], initialValue?: any[]) {
  if (!initialValue || !initialValue[0]) {
    return;
  }
  const initialValueElement = initialValue[0];
  Object.keys(initialValueElement).forEach((key) => {
    const descriptor = colDesc.find((desc) => desc.fieldName === key);
    descriptor && (descriptor.initialValue = initialValueElement[key]);
  });
}

/**
 * This function checks that an array property residing in "fieldsValue", denoted
 * by "embeddedArrayPath" has no duplicate values for property "fieldName" and
 * returns true if "value" is part of the duplicates
 * @export
 * @param {(string[] | null)} embeddedArrayPath denotes where the collection is inside fieldsValue.
 * @param {string} fieldName the name of the field inside the rows of the collection.
 * @param {*} fieldsValue the object that has the collection embedded.
 * @param {*} value the value to check.
 * @return {*}  {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDuplicate(embeddedArrayPath: string[] | null, fieldName: string, fieldsValue: any, value: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function duplicates(values: any[]) {
    return values.filter((item, index) => index !== values.indexOf(item));
  }

  const extracted =
    embeddedArrayPath === null
      ? fieldsValue
      : embeddedArrayPath.reduce((objectToWorkWith, pathElement) => {
          return objectToWorkWith[pathElement];
        }, fieldsValue);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractedFiltered = extracted?.filter((each: any) => each !== undefined && each !== null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldValuesOnly = extractedFiltered?.map((each: any) => each[fieldName]);
  return duplicates(fieldValuesOnly ?? []).includes(value);
}

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
  return `${outerKey}-${desc.fieldName}`;
}
