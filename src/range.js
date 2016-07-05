export default function range (start, end) {
  return {
    start,
    end,

//    ------
//       ------
//  ---  4
//  0 2
//
//  0123
//  ---
//    --

    overlaps (range, offset = 0) {
      const offsetStart = start + offset;
      const offsetEnd = end + offset;

      const overlappingLeft = range.start <= offsetEnd && offsetEnd <= range.end;
      const overlappingRight = offsetStart <= range.end && range.end <= offsetEnd;

      return overlappingRight || overlappingLeft;
    }
  };
}

