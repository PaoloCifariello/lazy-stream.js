require('./stream.js');

/* Array test */

var arr = [-2, -100, 2, 1, 2, 3, 4];


var res = arr.stream()
			.map(function(x) { return x + 1; })
			.filter(function(x) { return x > 0 ;})
			.map(function(x) { return x * x; })
   		   	.getAll();

console.log(res);