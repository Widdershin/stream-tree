import range from './range';
import vm from 'vm';

function breakUpLine (line) {
  const initialState = {tokens: [], parsingCode: false, parsingAssignment: false, codeStartIndex: null, assignmentStartIndex: null};

  const {tokens, parsingAssignment, assignmentStartIndex, parsingCode, codeStartIndex} = line
    .split('')
    .reduce((state, character, index) => {
      if (character === ' ' && !state.parsingCode && !state.parsingAssignment) { return state; }

      if (character === '{') {
        return {
          ...state,
          codeStartIndex: index,
          parsingCode: true,
          tokens: [...state.tokens, {type: 'code', code: ''}]
        };
      }

      if (character === '}') {
        const tokens = state.tokens.slice();

        tokens[tokens.length - 1].range = range(state.codeStartIndex, index);

        return {
          ...state,
          parsingCode: false,
          codeStartIndex: null,
          tokens
        };
      }

      if (state.parsingCode) {
        const tokens = state.tokens.slice();

        tokens[tokens.length - 1].code += character;

        return {
          ...state,

          tokens
        };
      }

      if (character === '|') {
        return {
          ...state,
          tokens: [...state.tokens, {type: '|', range: range(index, index)}]
        };
      }

      if (character === '\\') {
        return {
          ...state,
          tokens: [...state.tokens, {type: '\\', range: range(index, index), offset: -1}]
        };
      }

      if (character === '/') {
        return {
          ...state,
          tokens: [...state.tokens, {type: '/', range: range(index, index), offset: +1}]
        };
      }

      if (character === 'v') {
        return {
          ...state,
          tokens: [...state.tokens, {type: 'v', range: range(index, index)}]
        };
      }

      if (state.parsingAssignment) {
        const tokens = state.tokens.slice();
        const assignmentToken = tokens[tokens.length - 1];

        if (character === ' ') {
          assignmentToken.range = range(state.assignmentStartIndex - 1, index + 1);

          return {
            ...state,

            parsingAssignment: false,

            tokens
          };
        }

        assignmentToken.name += character;

        return {
          ...state,

          tokens
        };
      }

      return {
        ...state,

        parsingAssignment: true,

        assignmentStartIndex: index,

        tokens: [...state.tokens, {type: 'assignment', name: character}]
      };
    }, initialState);

  const lastToken = tokens[tokens.length - 1];

  if (parsingAssignment) {
    lastToken.range = range(assignmentStartIndex - 1, line.length + 1);
  }

  if (parsingCode) {
    lastToken.range = range(codeStartIndex - 1, line.length + 1);
  }

  return tokens;
}
export default function diagram (strings, ...values) {
  let lines = strings.raw[0].split('\n');
  let given = {};

  if (values[0]) {
    given = values[0];
    lines = strings.raw[1].split('\n');
  }

  return function main (sources) {
    const initialState = {
      channels: [],
      returnValue: {}
    };

    const result = lines.reduce((state, line) => {
      const tokens = breakUpLine(line);

      if (tokens.length === 0) {
        return state;
      }

      const newChannels = tokens.map((token, index) => {
        const overlappingChannels = state
          .channels.filter(channel => token.range.overlaps(channel.range, token.offset || 0));

        if (token.type === 'code') {
          let input;

          if (overlappingChannels.length === 1 && token.code.startsWith('.')) {
            input = overlappingChannels[0].value;

            token.code = `input${token.code}`;
          }

          const values = {};

          if (overlappingChannels.length === 2) {
            for (const channel of overlappingChannels) {
              values[channel.name] = channel.value;
            }
          }

          const context = {sources, ...values, input, ...given};

          const result = vm.runInNewContext(token.code, context);

          return {...token, value: result, readyToAssign: false};
        }

        if (token.type === '|' || token.type === '/' || token.type === '\\') {
          return {...token, name: overlappingChannels[0].name, value: overlappingChannels[0].value, readyToAssign: false};
        }

        if (token.type === 'v') {
          return {...token, value: overlappingChannels[0].value, readyToAssign: true};
        }

        if (token.type === 'assignment' && overlappingChannels[0].readyToAssign) {
          state.returnValue[token.name] = overlappingChannels[0].value;
          return;
        }

        if (token.type === 'assignment') {
          return {...token, value: overlappingChannels[0].value, readyToAssign: false, name: token.name}
        };
      }).filter(channel => !!channel);

      state.channels = newChannels;

      console.log(newChannels);

      return Object.assign({}, state);
    }, initialState);

    return result.returnValue;
  };
}

// Given a diagram
// Which consists of a series of lines
// On each line
// We can have one or more of these tokens, separated by 2 or more spaces
// code block, wrapped in squigglies: {1 + 1}
// a |, to indicate passing a value
// a V, to pre-empt assinging a value
// a bare name, like potato, to assign a value on the last line
//
// For each line
//  Break the line up into tokens
//  {string, charRange}
//
//  For each token
//    Determine the input from the previous channels
//      token.charRange.overlaps(channel.charRange)
//
//    If |
//      return previous channel value
//
//    if V
//      ready previous channel for assignment
//
//    if prevousChannel ready for assignment
//      assign channel value to line name
//
//    if \
//      return previous channel value (offset to left by one)
//
//    if /
//      return previous channel value (offset to right by one)
//
//    Else code
//
//    If no input, no worries
//
//    If one input
//      If code
//         replace start of code with input
//
//    Execute code
//
//    Return channel with code value
