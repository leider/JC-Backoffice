const format = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

const formatEng = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatToGermanNumberString(amount: number): string {
  return format.format(amount);
}

export function formatToEnglishNumberString(amount: number): string {
  return formatEng.format(amount);
}
