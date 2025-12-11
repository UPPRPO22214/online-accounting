export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export const saveLocalStorageItem = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeLocalStorageItem = <T>(key: string) => {
  const value = getLocalStorageItem<T | undefined>(key, undefined);
  localStorage.removeItem(key);
  return value;
};
