import {useCallback, useState} from "react";

interface UseLocalStorageProps<T> {
  key: string;
  initialValue: T;
}

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
}

export default function useLocalStorage<T>(props: UseLocalStorageProps<T>): UseLocalStorageReturn<T> {
  const {key, initialValue} = props;

  const [value, setValue] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch (e) {
        console.error(e);
        // remove this key from local storage
        window.localStorage.removeItem(key);
        return initialValue;
      }
    } else {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    setValue(value);
  }, [key]);

  return {value, setValue: setStoredValue};
}
