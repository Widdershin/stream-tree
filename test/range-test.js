
/* globals describe, it */
import range from '../src/range';
import assert from 'assert';

describe('range', () => {
  it('can tell you if two ranges overlap', () => {
    assert.equal(range(0, 1).overlaps(range(1, 2)), true);
  });

  it('returns false if two ranges do not overlap', () => {
    assert.equal(range(0, 1).overlaps(range(2, 3)), false);
  });

  it('returns false if two ranges do not overlap and the first is larger', () => {
    assert.equal(range(4, 5).overlaps(range(2, 3)), false);
  });

  it('returns true if one range is inside of another', () => {
    assert.equal(range(0, 5).overlaps(range(1, 2)), true);
  });

  it('returns true if the first range is inside of the second', () => {
    assert.equal(range(1, 2).overlaps(range(0, 5)), true);
  });

  it('optionally takes an offset for overlaps', () => {
    assert.equal(range(1, 2).overlaps(range(4, 5), +3), true);
  });
});
