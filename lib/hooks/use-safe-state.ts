import { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';

export function useSafeState<T>(initialState: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialState);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setSafeState: Dispatch<SetStateAction<T>> = (value) => {
    if (isMounted.current) {
      setState(value);
    }
  };

  return [state, setSafeState];
}
