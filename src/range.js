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

    overlaps (range) {
      const overlappingLeft = range.start <= end && end <= range.end;
      const overlappingRight = start <= range.end && range.end <= end;

      return overlappingRight || overlappingLeft;
    }
  };
}

