[![npm version](https://badge.fury.io/js/lazy-streamjs.svg)](http://badge.fury.io/js/lazy-streamjs)
# Stream.js
An simple lazy evaluated stream API in Javascript inspired by Java 8 stream

## Installation
`npm install lazy-streamjs`

## API

### Initial operations

You can use the global object `stream` to create your stream:
##### stream.range(from, to)
Get a new stream of numbers in the range `[from, to[`

##### stream.function(generatorFunction)
Get a new stream from a function `generatorFunction` called everytime a new element is needed

##### stream(data);
Get a Stream from your collection (Array, Object or String) passing it to `stream` function:

### Intermediate operations
Apply intermediate operations to the stream by just concatenating them:

##### .map(mapFunction)
Map all elements using `mapFunction`

##### .filter(filterFunction)
Take only elements that satisfy the predicate `filterFunction`

##### .take(n)
Take first `n` elements of the stream

##### .foldl(foldlFunction, base)
Apply foldl using `foldlFunction` and `base` as base case

##### .foldr(foldrFunction, base)
Apply foldr using `foldrFunction` and `base` as base case

### Final operations

You can get the result using:

##### .getNext()
Will get back the next element of the stream or `null` at the end

##### .getAll()
Will get back all the elements of the stream

### Example
```javascript
var stream = require('lazy-streamjs');

var data = [-2, -100, 2, 1, 2, 3, 4];
var result = stream(data)
                 .map(function(x) { return x + 1; })
                 .filter(function(x) { return x > 0; })
                 .getAll();

console.log(result);
```
Will print 
`
3 
2
3
4
5
`

```javascript
var stream = require('lazy-streamjs');

var fibGenerator = (function() {
	var e1 = 0,
		e2 = 1;

	return function() {
		var next = e1 + e2;
		e1 = e2;
		e2 = next;

		return next;
	}

})();

res = Stream.function(fibGenerator)
			.take(10)
			.getAll();
```
Will print the first 10 elements of the Fibonacci Series (will not cause an infinite loop because of it's lazy evaluated)
