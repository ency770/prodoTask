// React types
import { Task, TaskStatus, User } from '@/models/types';

// Fix React module
declare module 'react' {
  // React hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useContext<T>(context: any): T;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  export function useRef<T = undefined>(initialValue?: T): { current: T };
  export function useLayoutEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  
  // React events
  export interface ChangeEvent<T = Element> {
    target: T & {
      value: string;
      checked?: boolean;
    };
    currentTarget: T;
  }
  
  export interface FormEvent<T = Element> {
    currentTarget: T;
    preventDefault(): void;
  }
  
  // React component types
  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement | null;
  }
  
  export type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
  export interface ReactElement<P = any> {
    type: any;
    props: P;
    key: Key | null;
  }
  export type ReactFragment = {} | ReactNodeArray;
  export type ReactNodeArray = Array<ReactNode>;
  export type ReactPortal = any;
  export type Key = string | number;
  
  // Context API
  export function createContext<T>(defaultValue: T): Context<T>;
  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }
  export interface Provider<T> {
    (props: { value: T; children?: ReactNode }): ReactElement | null;
  }
  export interface Consumer<T> {
    (props: { children: (value: T) => ReactNode }): ReactElement | null;
  }
  
  // JSX namespace
  export namespace JSX {
    interface Element extends ReactElement {}
    
    interface ElementAttributesProperty {
      props: {};
    }
    
    interface ElementChildrenAttribute {
      children: {};
    }
    
    interface IntrinsicAttributes {
      key?: Key;
    }
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 