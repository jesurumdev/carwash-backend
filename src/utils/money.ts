export const pesosToCents = (value: number): number => {
  return Math.round(value * 100);
};

export const centsToPesos = (value: number): number => {
  return value / 100;
};
