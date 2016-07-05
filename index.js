import {run} from '@cycle/xstream-run';
import {div, makeDOMDriver} from '@cycle/dom';
import xs from 'xstream';
import vm from 'vm';

/* function main ({DOM}) {
  return {
    DOM: xs.of(div('hello world'))
  };
}*/

function diagram (strings, ...values) {
  const lines = strings[0].split('\n');

  return function main (sources) {
    const world = Object.assign({}, sources, {xs, div, value: null, aboutToAssign: false, returnValue: {}});

    const result = lines.reduce((state, line) => {
      if (line.trim() === '') { return state; }
      if (line.trim() === '|') { return state; }
      if (line.trim() === 'V') { return Object.assign({}, state, {aboutToAssign: true}); }

      if (state.aboutToAssign) {
        const source = line.trim();

        state.returnValue[source] = state.value;

        state.aboutToAssign = false;
      }  else {
        state.value = vm.runInNewContext(line, state);
      }

      return Object.assign({}, state);
    }, world);

    return result.returnValue;
  };
}

const main = diagram`
    {xs.of(div('hello world'))}
              |
              V
             DOM
`;

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers);
