export function parseDateWithHyphen(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function parseDateOnlyNumbers(dateString) {
  const year = Number(dateString.substring(0, 4));
  const month = Number(dateString.substring(4, 6));
  const day = Number(dateString.substring(6, 8));

  return new Date(year, month - 1, day);
}
