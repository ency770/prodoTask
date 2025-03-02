// Don't import React directly as it causes circular reference
// import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // HTML elements
      a: any;
      button: any;
      div: any;
      form: any;
      h1: any;
      h2: any;
      h3: any;
      input: any;
      label: any;
      main: any;
      p: any;
      select: any;
      option: any;
      span: any;
      svg: any;
      path: any;
      
      // Fallback for any other elements
      [elemName: string]: any;
    }
  }
} 