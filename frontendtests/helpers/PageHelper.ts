const { I } = inject();

export const fillDropdown = (labelText: string, optionToSelect: string) => {
  const formItem = locate(".ant-form-item").withDescendant(
    locate("label").withText(labelText),
  );
  I.click(formItem.find(".ant-select-selector"));

  I.fillField(
    formItem.find(".ant-select-selection-search-input"),
    optionToSelect,
  );

  I.click(locate(".ant-select-item-option-content").withText(optionToSelect));
};
