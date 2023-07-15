import _ from "lodash";
import { UseMutationResult } from "@tanstack/react-query";
import { App } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";

export interface SaveCollectionParams {
  oldItems: { id: string }[];
  newItems: { id: string }[];
  mapper: (item: any) => any;
  saveMutation: UseMutationResult<any, any, any>;
  deleteMutation: UseMutationResult<any, any, any>;
}

export function calculateChangedAndDeleted(newItems: { id: string }[], oldItems: { id: string }[], mapper: (item: any) => any) {
  const currentIds = _.map(newItems, "id");
  const oldIds = _.map(oldItems, "id");

  const deletedIds = _.difference(oldIds, currentIds);
  const addedIds = _.difference(currentIds, oldIds);

  const changedIds = _.map(_.differenceWith(oldItems, newItems, _.isEqual), "id");
  const allChangedIds = _.uniq(addedIds.concat(changedIds));

  const changed = (newItems.filter((item) => allChangedIds.includes(item.id)) || []).map(mapper);
  return { deletedIds, changed };
}

export function useSaveCollection(notification: NotificationInstance) {
  function saveCollection({ oldItems, newItems, mapper, saveMutation, deleteMutation }: SaveCollectionParams) {
    return async () => {
      const { deletedIds, changed } = calculateChangedAndDeleted(newItems, oldItems, mapper);
      changed.forEach((item) => saveMutation.mutate(item));
      deletedIds.forEach((idAsName) => deleteMutation.mutate(idAsName));
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Änderungen wurden gespeichert",
        duration: 5,
      });
    };
  }
  return saveCollection;
}
