export function weightedRandom(weight: number): boolean {
  if (weight < 0 || weight > 1) {
    throw new Error('Weight must be a number between 0 and 1 (inclusive).');
  }

  const randomValue = Math.random();
  return randomValue < weight;
}
