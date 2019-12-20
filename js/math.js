const minmax = (a, b) => {
  let min, max;
  if (b !== undefined) {
    min = a;
    max = b;
  } else {
    min = 0;
    max = a;
  }
  return [min, max];
};
export const random = (a = 1, b) => {
  const [min, max] = minmax(a, b);
  const range = max - min;
  return Math.random() * range + min;
};

export const range = (a, b) => {
  const [min, max] = minmax(a, b);
  const range = max - min;
  return [...Array(range).keys()].map(x => x + min);
};
