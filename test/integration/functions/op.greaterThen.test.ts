import { bool, dateTime, merge, numeric, str } from '../../util/Aliases';
import { Notation } from '../../util/TestTable';
import type { ITestTableConfigBase } from '../../util/utils';
import { runTestTable } from '../../util/utils';

const config: ITestTableConfigBase = {
  arity: 2,
  operation: '>',
  aliases: merge(numeric, str, dateTime, bool),
  notation: Notation.Infix,
};

describe('evaluation of \'>\'', () => {
  describe('with numeric operands like', () => {
    runTestTable({
      ...config,
      testTable: `
        -5i 3i = false
        -5f 3f = false
        -5d 3d = false
        -5f 3i = false
        -5f 3i = false
    
        3i 3i = false
        3d 3d = false
        3f 3f = false
    
        3i -5i = true
        3d -5d = true
        3f -5f = true
        3i -5f = true
        3d -5f = true
    
         3i 3f = false
         3i 3d = false
         3d 3f = false
        -0f 0f = false
    
         INF  INF = false
        -INF -INF = false
         INF  3f  = true
         3f   INF = false
        -INF  3f  = false
         3f  -INF = true
    
        INF NaN = false
        NaN NaN = false
        NaN 3f  = false
        3f  NaN = false
      `,
      errorTable: `
        "2"^^example:int "0"^^example:int = 'Argument types not valid for operator'
      `,
    });
  });

  describe('with string operands like', () => {
    runTestTable({
      ...config,
      testTable: `
        empty empty = false
        empty aaa   = false
        aaa   empty = true
        aaa   aaa   = false
        aaa   bbb   = false
        bbb   aaa   = true
      `,
    });
  });

  describe('with boolean operands like', () => {
    runTestTable({
      ...config,
      testTable: `
        true  true  = false
        true  false = true
        false true  = false
        false false = false
      `,
    });
  });

  describe('with dateTime operands like', () => {
    runTestTable({
      ...config,
      testTable: `
        earlyN earlyZ = false
        earlyN earlyN = false
        earlyZ earlyZ = false
    
        earlyN lateN  = false
        earlyN lateZ  = false
        earlyZ lateZ  = false
        earlyZ lateN  = false
    
        lateN earlyN  = true
        lateN earlyZ  = true
        lateZ earlyN  = true
        lateZ earlyZ  = true
    
        edge1 edge2   = false
      `,
    });
  });
});
