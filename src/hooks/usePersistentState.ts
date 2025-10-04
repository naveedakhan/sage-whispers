import { useEffect, useState } from "react";

interface UsePersistentStateOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

const isBrowser = typeof window !== "undefined";

export const usePersistentState = <T,>(
  key: string,
  defaultValue: T,
  options: UsePersistentStateOptions<T> = {}
) => {
  const { serialize, deserialize } = options;
  const isStringDefault = typeof defaultValue === "string";

  const readValue = () => {
    if (!isBrowser) {
      return defaultValue;
    }

    const storedValue = window.localStorage.getItem(key);

    if (storedValue === null) {
      return defaultValue;
    }

    try {
      if (deserialize) {
        return deserialize(storedValue);
      }

      if (isStringDefault) {
        return storedValue as unknown as T;
      }

      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.warn(`Failed to parse localStorage value for key "${key}":`, error);
      return defaultValue;
    }
  };

  const [state, setState] = useState<T>(readValue);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    try {
      const valueToStore = serialize
        ? serialize(state)
        : typeof state === "string"
        ? (state as unknown as string)
        : JSON.stringify(state);

      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.warn(`Failed to save localStorage value for key "${key}":`, error);
    }
  }, [key, state, serialize]);

  return [state, setState] as const;
};
