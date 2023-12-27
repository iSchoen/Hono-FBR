export const compact = <T>(arr: (T | undefined)[]): T[] => {
  const compactedArray: T[] = [];

  for (const item of arr) {
    if (item) {
      compactedArray.push(item);
    }
  }

  return compactedArray;
};
