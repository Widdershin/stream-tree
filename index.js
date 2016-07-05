import {run} from '@cycle/xstream-run';
import {button, div, makeDOMDriver} from '@cycle/dom';
import xs from 'xstream';
import vm from 'vm';

import diagram from './src/diagram';

/* function main ({DOM}) {
  return {
    DOM: xs.of(div('hello world'))
  };
}*/


function view (count) {
  return (
    div('.counter', [
      'Count:' + count,
      button('.add', 'Add'),
      button('.subtract', 'Subtract')
    ])
  );
}

const main = diagram`
                Given: ${{xs, view}}

                    {sources.DOM}
                    /           \
                   /             \
       {.select('.add')}       {.select('.subtract')}
                   |              |
      {.events('click')}       {.events('click')
                   |              |
              {.mapTo(+1)}    {.mapTo(-1)}
                   \             /
                  add$        subtract$
                    \           /
              {xs.merge(add$, subtract$)}
                           |
       {.fold((total, change) => total + change, 0)}
                           |
                      {.map(view)}
                           |
                           v
                          DOM
`;

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers);
