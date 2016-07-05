import {run} from '@cycle/xstream-run';
import {button, div, makeDOMDriver} from '@cycle/dom';
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
    const world = Object.assign({}, sources, {value: null, aboutToAssign: false, returnValue: {}});

    const result = lines.reduce((state, line) => {
      let code = line.trim();

      if (code === '') { return state; }
      if (code === '|') { return state; }
      if (code === 'V') { return Object.assign({}, state, {aboutToAssign: true}); }
      if (code.startsWith('{.')) {
        code = line.replace('{.', '{state.value.');
      }

      if (state.aboutToAssign) {
        const source = code;

        state.returnValue[source] = state.value;

        state.aboutToAssign = false;
      }  else {
        state.value = eval(code);
      }

      return Object.assign({}, state);
    }, world);

    return result.returnValue;
  };
}

function view (count) {
  return (
    div('.counter', [
      'Count:' + count,
      button('.add', 'Add')
    ])
  );
}

const main = diagram`
             {sources.DOM}
                   |
           {.select('.add')}
                   |
           {.events('click')}
                   |
              {.mapTo(+1)}
                   |
 {.fold((total, change) => total + change, 0)}
                   |
              {.map(view)}
                   V
                  DOM
`;

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers);
