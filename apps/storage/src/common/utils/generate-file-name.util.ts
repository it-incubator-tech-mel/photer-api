export function generateFileName(): string {
  const date = new Date().toISOString().split('T')[0]; // "2025-04-10"
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${date}-${random}`;
}
