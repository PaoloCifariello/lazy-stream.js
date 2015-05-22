require('../index.js');

/* Array test */
console.log("Simple array")

var arr = [-2, -100, 2, 1, 2, 3, 4];


var res = arr.stream()
			.map(function(x) { return x + 1; })
			.take(5)
			.filter(function(x) { return x > 0 ;})
			.map(function(x) { return x * x; })
			.getAll();

console.log(res);

arr = [1,2,3,4,5,6];

/* Reverse list */
console.log("Foldr to reverse stream");

res = arr.stream()
			.foldr(function(e1, e2) {
   		   		e2.push(e1);
   		   		return e2;

   		   	}, []);

console.log(res);

/* Get elements from 10 to 100 */
console.log("Stream of int from 10 to 15");

res = Stream.fromRange(10,15)
			.getAll();

console.log(res);


/* Fibonacci series */
console.log("Getting Fibonacci series up to 10 elements");

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

res = Stream.fromFunction(fibGenerator)
			.take(10)
			.getAll();

console.log(res);