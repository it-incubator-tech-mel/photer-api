export function parseDateFromDdMmYyyy(dateStr: string): Date | undefined {
  const regex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!regex.test(dateStr)) return undefined;

  const [day, month, year] = dateStr.split('.').map(Number);
  const date = new Date(year, month - 1, day);

  // Дополнительная проверка, что дата не "съехала"
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}
