const STOP_WORDS = new Set([
  'de', 'el', 'la', 'los', 'las',
  'un', 'una', 'y', 'con', 'para',
  'del', 'al', 'en', 'por', 'a',
]);

const COLLISION_SUFFIXES = [
  'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
  'V', 'W', 'X', 'Y', 'Z',
];

export function generateSkuBase(name: string): string {
  const words = name
    .normalize('NFD')                        // quita acentos
    .replace(/[\u0300-\u036f]/g, '')         // limpia diacríticos
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')            // solo letras, números y espacios
    .split(/\s+/)
    .filter((word) => !STOP_WORDS.has(word.toLowerCase()))
    .slice(0, 3);                            // máximo 3 palabras

  const parts = words.map((word) => word.slice(0, 3));

  return parts.join('-');
}

export function buildSku(base: string, sequence: number): string {
  const padded = String(sequence).padStart(3, '0');
  return `${base}-${padded}`;
}

export function buildSkuWithSuffix(
  base: string,
  sequence: number,
  suffixIndex: number,
): string {
  const padded = String(sequence).padStart(3, '0');
  const suffix = COLLISION_SUFFIXES[suffixIndex];
  return `${base}-${padded}-${suffix}`;
}