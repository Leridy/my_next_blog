import { useCallback, useState } from 'react';

interface UseLocalStorageProps<T> {
  key: string;
  initialValue: T;
}

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
}

export default function useLocalStorage<T>(
  props: UseLocalStorageProps<T>
): UseLocalStorageReturn<T> {
  const { key, initialValue } = props;

  const LS = localStorage || {
    getItem: () => null,
    setItem: () => null,
  };
  const [value, setValue] = useState<T>(() => {
    const storedValue = LS.getItem(key);
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch (e) {
        console.error(e);
        // remove this key from local storage
        LS.removeItem(key);
        return initialValue;
      }
    } else {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (value: T) => {
      LS.setItem(key, JSON.stringify(value));
      setValue(value);
    },
    [LS, key]
  );

  return { value, setValue: setStoredValue };
}
