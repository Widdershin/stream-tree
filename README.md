stream-tree
===

`stream-tree` is a way to write functions as ascii flowcharts in JavaScript.

<!-- share-code-between-examples -->

```js
import diagram from 'stream-tree';

const doubleNumbers = diagram`
  {sources.numbers}
         |
 {.map(i => i * 2)}
         |
   doubledNumbers
`;

console.log(doubleNumbers({numbers: [1, 2, 3]}))
// => {doubledNumbers: [2, 4, 6]}
```

This is equivalent to this es6 code:

```js
function doubleNumbers({numbers}) {
  return {
    doubledNumbers: numbers.map(i => i * 2)
  }
}
```

So `diagram` takes a string and returns a function that takes in a sources object and returns an object.

Why objects as arguments and return values?

`stream-tree` is designed to be used to write Cycle.js applications. A `main` function in Cycle.js takes in an object of streams and returns an object of streams.

Consider this counter example:

```js
function main (sources) {
  const add$ = sources.DOM
    .select('.add')
    .events('click')
    .mapTo(+1);

  const subtract$ = sources.DOM
    .select('subtract')
    .events('click')
    .mapTo(-1);

  const change$ = xs.merge(add$, subtract$);

  const count$ = change$.fold((total, change) => total + change, 0);

  return {
    DOM: count$.map(renderView)
  }
}

function renderView (count) {
  return (
    div('.counter', [
      `Count: ${count}`,

      button('.add', 'Add'),
      button('.subtract', 'Subtract')
    ])
  );
}
```

We can rewrite this with `stream-tree`:

```js
const main = diagram`
  Given: ${{xs, renderView}}

                  {sources.DOM}
                  /           \
   {.select('.add')}          {.select('.subtract')}
                 |              |
   {.events('click'}          {.events('click'}
                 |              |
        {.mapTo(+1)}          {.mapTo(-1)}
                  \            /
                 add$        subtract$
                    \        /
            {xs.merge(add$, subtract$})
                        |
    {.fold((total, change) => total + change, 0)}
                        |
                {.map(renderView)}
                        |
                       DOM
`;
```

We can also decompose this function into smaller functions:
```js

const intent = diagram`
                  {sources.DOM}
                  /           \
   {.select('.add')}          {.select('.subtract')}
                 |              |
   {.events('click'}          {.events('click'}
                 |              |
                add$          subtract$
`;

const model = diagram`
  Given: ${{xs}}

        {sources.add$}        {sources.subtract$}
                 |              |
        {.mapTo(+1)}          {.mapTo(-1)}
                  \            /
                 add$        subtract$
                    \        /
            {xs.merge(add$, subtract$})
                        |
    {.fold((total, change) => total + change, 0)}
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
  Given: ${{xs, view}}

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
```

