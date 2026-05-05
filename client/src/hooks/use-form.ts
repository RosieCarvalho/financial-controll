import { useState, useCallback } from "react";

export function useForm<T>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);

  const setFieldValue = useCallback((path: string, value: any) => {
    setValues((prev: any) => {
      const keys = path.split(".");
      const lastKey = keys.pop()!;
      const newState = { ...prev };
      let pointer = newState;

      for (const key of keys) {
        pointer[key] = { ...pointer[key] };
        pointer = pointer[key];
      }

      pointer[lastKey] = value;
      return newState;
    });
  }, []);

  const reset = useCallback(() => {
    setValues(initialState);
  }, [initialState]);

  return { values, setFieldValue, reset, setValues };
}
