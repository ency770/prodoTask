/// <reference types="next" />
/// <reference types="next/types/global" />

// This file ensures React is properly typed
declare module 'react' {
  // Cannot use 'export * from' in a declaration file
  // export * from 'react';
  
  // Cannot reference itself
  // export default React;
  
  // Add React namespace
  namespace React {
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    
    type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);
    
    interface Component<P = {}, S = {}> {
      render(): ReactNode;
      props: Readonly<P>;
      state: Readonly<S>;
      context: any;
    }
    
    type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
    type ReactFragment = {} | ReactNodeArray;
    type ReactNodeArray = Array<ReactNode>;
    type ReactPortal = any;
    type Key = string | number;
  }

  // Export the React namespace as the default export
  export = React;
} 