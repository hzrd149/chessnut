export function validationFilter<T extends unknown>(fn: (v: T) => any) {
  return (v: T) => {
    try {
      fn(v);
      return true;
    } catch (e) {
      return false;
    }
  };
}

export function arraySafeParse<In extends unknown, Out extends unknown>(
  arr: In[],
  fn: (v: In) => Out,
) {
  const parsed: Out[] = [];
  for (const item of arr) {
    try {
      parsed.push(fn(item));
    } catch (e) {}
  }
  return parsed;
}
