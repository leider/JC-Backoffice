const { I } = inject();

export const fillDropdown = (labelText: string, optionToSelect: string) => {
  const formItem = locate(".ant-form-item")
    .withDescendant(locate("b").withText(labelText))
    .withDescendant(".ant-select");
  const selectControl = formItem.find(".ant-select");

  I.waitForElement(formItem, 5);
  I.scrollTo(formItem);
  I.click(selectControl);
  I.click(
    locate(
      ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content",
    ).withText(optionToSelect),
  );
};
