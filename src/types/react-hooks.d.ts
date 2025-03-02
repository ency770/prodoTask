declare module 'react' {
  // Add React hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useContext<T>(context: any): T;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  export function useRef<T = undefined>(initialValue?: T): { current: T };
  export function useLayoutEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  
  // Add Context API
  export function createContext<T>(defaultValue: T): {
    Provider: any;
    Consumer: any;
    displayName?: string;
  };

  // Add React event types
  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }

  export interface FormEvent<T = Element> {
    currentTarget: T;
    preventDefault(): void;
  }
  
  // Add JSX attributes
  export namespace JSX {
    interface IntrinsicAttributes {
      key?: string | number;
    }
  }
} 