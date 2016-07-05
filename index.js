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


function renderView (count) {
  return (
    div('.counter', [
      'Count:' + count,
      button('.add', 'Add'),
      button('.subtract', 'Subtract'),
      button('.reset', 'Reset'),

      pre('function main (sources) {' + main.toString() + '}'),
      pre('function intent (sources) {' + intent.toString() + '}'),
      pre('function model (sources) {' + model.toString() + '}'),
      pre('function view (sources) {' + view.toString( + '}'))
    ])
  );
}

const add = (count) => count + 1;
const subtract = (count) => count - 1;
const reset = (count) => 0;

const intent = diagram`
                     {      sources.DOM          }
                     /           |               \
                    /            |                \
                   /             |                 \
     {.select('.add')}  {.select('.subtract')}  {.select('.reset')}
                |                |                   |
    {.events('click')}    {.events('click')}     {.events('click')}
                |                |                   |
               add$          subtract$            reset$
`;

const model = diagram`
Given: ${{xs, add, subtract, reset}}

   {sources.add$}   {sources.subtract$}   {sources.reset$}
         |                 |                  |
    {.mapTo(add)}    {.mapTo(subtract)}   {.mapTo(reset)}
         |                 |                  |
        add$           subtract$          reset$
          \                |               /
        { xs.merge(add$, subtract$, reset$) }
                           |
     {.fold((state, reducer) => reducer(state), 0)}
                           |
                         count$
`;

const view = diagram`
Given: ${{renderView}}

        {sources.count$}
               |
      {.map(renderView)}
               |
             vtree$
`;

const main = diagram`
  Given: ${{intent, model, view}}

          {sources}
              |
          {intent}
              |
           {model}
              |
           {view}
              |
          {.vtree$}
              |
             DOM
`;

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers);
