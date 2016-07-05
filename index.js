import {run} from '@cycle/xstream-run';
import {button, div, makeDOMDriver, pre} from '@cycle/dom';
import xs from 'xstream';
import vm from 'vm';

import diagram from './src/diagram';

/* function main ({DOM}) {
  return {
    DOM: xs.of(div('hello world'))
  };
}*/


function view (count, diagram) {
  return (
    div('.counter', [
      'Count:' + count,
      button('.add', 'Add'),
      button('.subtract', 'Subtract'),
      button('.reset', 'Reset'),

      pre(diagram)
    ])
  );
}

const add = (count) => count + 1
const subtract = (count) => count - 1
const reset = (count) => 0

const main = diagram`
            Given: ${{xs, view, add, subtract, reset}}

                    {sources.DOM}
                    |         | \
                    |         |  \
                    |         |   \
                    |          \   \
                    |           \  {.select('.reset')}
                   /             \                    \
       {.select('.add')}   {.select('.subtract')}     |
                   |              |                  {.events('click')}
      {.events('click')}       {.events('click')}     |
                   |              |                   |
              {.mapTo(add)}    {.mapTo(subtract)}    {.mapTo(reset)}
                   |             /                    /
                  add$        subtract$            reset$
                    \           |                  /
                  {  xs.merge(add$, subtract$, reset$) }
                           |
       {.fold((state, reducer) => reducer(state), 0)}
                           |
            {.map(count => view(count, diagram))}
                           |
                           v
                          DOM
`;

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers);
