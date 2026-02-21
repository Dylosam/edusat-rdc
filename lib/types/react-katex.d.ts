<<<<<<< HEAD
declare module 'react-katex' {
  import * as React from 'react';

  export interface MathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
  }

  export const InlineMath: React.FC<MathProps>;
  export const BlockMath: React.FC<MathProps>;
}
=======
declare module "react-katex";declare module "react-katex";
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
