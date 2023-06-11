/* eslint-disable @typescript-eslint/no-explicit-any */
import {CollectionHeight} from '../types';
import {CollectionColDesc} from './OrrpInlineCollectionEditable/types';

export const initialSpan = (desc: CollectionColDesc) => {
  switch (desc.width) {
    case 'xs':
      return 3;
    case 's':
      return 4;
    case 'm':
      return 6;
    case 'l':
      return 8;
    case 'xl':
      return 12;
    default:
      throw new Error(
          'A number width is not allowed for OrrpInlineCollectionEditable'
      );
  }
};

export const getCollectionHeightsInPixel = (height: CollectionHeight) => {
  switch (height) {
    case 'xs':
      return 160;
    case 'sm':
      return 240;
    case 'md':
      return 360;
    case 'lg':
      return 560;
    case 'xl':
      return 760;
    default:
      throw new Error(
          'The entered collection height is not within the list of possible options.'
      );
  }
};

export function addInitialValueFromObjectToColDescs(
    colDesc: CollectionColDesc[],
    initialValue?: any[]
) {
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
export function isDuplicate(
    embeddedArrayPath: string[] | null,
    fieldName: string,
    fieldsValue: any,
    value: any
): boolean {
  function duplicates(values: any[]) {
    return values.filter((item, index) => index !== values.indexOf(item));
  }

  const extracted =
      embeddedArrayPath === null
          ? fieldsValue
          : embeddedArrayPath.reduce((objectToWorkWith, pathElement) => {
            return objectToWorkWith[pathElement];
          }, fieldsValue);
  const extractedFiltered = extracted?.filter((each: any) => each !== undefined && each !== null);
  const fieldValuesOnly = extractedFiltered?.map((each: any) => each[fieldName]);
  return duplicates(fieldValuesOnly ?? []).includes(value);
}
