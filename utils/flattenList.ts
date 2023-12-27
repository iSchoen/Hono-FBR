type NestedArray<T> = (T | NestedArray<T>)[];

export const flattenList = <T>(arr: NestedArray<T>[]): T[] => {
  const flatArray: T[] = [];

  const flattenDeep = (currentItem: NestedArray<T> | T) => {
    if (Array.isArray(currentItem)) {
      for (const item of currentItem) {
        flattenDeep(item);
      }
    } else {
      flatArray.push(currentItem);
    }
  };

  flattenDeep(arr);
  return flatArray;
};
