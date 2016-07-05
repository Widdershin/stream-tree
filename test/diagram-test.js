/* globals describe, it */
import diagram from '../src/diagram';
import assert from 'assert';

describe('diagram', () => {
  it('takes an ascii diagram and returns a function that transforms objects', () => {
    const test = diagram`
      {sources.numbers}
             |
     {.map(i => i * 2)}
             |
             v
       doubledNumbers
    `;

    assert.deepEqual(test({numbers: [1, 2, 3]}).doubledNumbers, [2, 4, 6]);
  });

  it('handles branches', () => {
    const test = diagram`
          {sources.numbers}
           |             |
 {.map(i => i * 2)}  {.map(i => i * 3)}
          |               |
          |               |
          v               v
  doubledNumbers     tripledNumbers
    `;

    const result = test({numbers: [1, 2, 3]});

    assert.deepEqual(result.doubledNumbers, [2, 4, 6]);
    assert.deepEqual(result.tripledNumbers, [3, 6, 9]);
  });

});
