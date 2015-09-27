(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var StreamGlobal = require('./src/StreamGlobal'),
	stream = require('./src/stream');

global.Stream = global.Stream || StreamGlobal;
Object.prototype.stream = Object.prototype.stream || stream;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/StreamGlobal":2,"./src/stream":5}],2:[function(require,module,exports){
var StreamObject = require('./StreamObject');

var GlobalStream = 
{
	fromRange: function(from, to) {
		var so = new StreamObject();

		function* seedGenerator() {
			while (from < to){
				yield from++;
			}
		}

		so.addSeedFromFunction(seedGenerator);

		return so;
	},

	fromFunction: function(seedFunction) {
		var so = new StreamObject();

		function* seedGenerator (){
			var nextValue = seedFunction();

			while (nextValue != undefined) {
				yield nextValue;
				nextValue = seedFunction();
			}
		}

		so.addSeedFromFunction(seedGenerator)
		
		return so;

	}
}

module.exports = GlobalStream;
},{"./StreamObject":3}],3:[function(require,module,exports){
var StreamOperations = require('./StreamOperations'),
	util = require('./util');

/* Stream object for simple variables */
function StreamObject() {
	this.end = false;
}


/* Intermediate operations */

StreamObject.prototype.map = function(mapFunction) {

	var idx = this.operations.getLastIndex();

	this.operations.addOperation(this.operations.MapOperation(mapFunction, ++idx))
	return this;
};

StreamObject.prototype.filter = function(filterFunction) {

	var idx = this.operations.getLastIndex();

	this.operations.addOperation(this.operations.FilterOperation(filterFunction, ++idx))
	return this;
};


StreamObject.prototype.take = function(n) {

	var idx = this.operations.getLastIndex();

	this.operations.addOperation(this.operations.TakeOperation(n, ++idx))
	return this;
};

StreamObject.prototype.iterate = function(nIterations) {


	return this;
};

/** Final operations */

StreamObject.prototype.foldl = function (foldlFunction, base) {
	
	var nextValue = this.operations.getNext();

	if (nextValue.done === true) 
		return base;

	return arguments.callee.call(this, foldlFunction, foldlFunction(base, nextValue.value));
};


StreamObject.prototype.foldr = function (foldrFunction, base) {
	
	var nextValue = this.operations.next();

	if (nextValue.done === true) 
		return base;

	return foldrFunction(nextValue.value, arguments.callee.call(this, foldrFunction, base));
};


StreamObject.prototype.getNext = function () {
	var nextValue = this.operations.next();

	if (this.end) {
		return;
	}

	if (nextValue.done === false)
		return nextValue.value;

	this.close();
};

StreamObject.prototype.getAll = function() {

	var values = [],
		nextValue = this.operations.next();

	while (nextValue.done === false) {
		values.push(nextValue.value);
		nextValue = this.operations.next();
	}

	this.close();

	return values;
};

StreamObject.prototype.anyMatch = function (anyMatchPredicate) {
	
	var nextValue = this.operations.next();

	while (nextValue.done === false) {
	
		if (anyMatchPredicate(nextValue.value))
			return true;

		nextValue = this.operations.next();
	} 
	
	return false;
};

StreamObject.prototype.allMatch = function (allMatchPredicate) {
	
	var nextValue = this.operations.next();

	while (nextValue.done === false) {
	
		if (!allMatchPredicate(nextValue.value))
			return false;

		nextValue = this.operations.next();
	}

	return true;
};


StreamObject.prototype.addSeedFromCollection = function(seed) {
	
	var seedGenerator = util.getSeedFunction(seed);
	this.addSeedFromFunction(seedGenerator);
	this.operations.setContext(seed);
};

StreamObject.prototype.addSeedFromFunction = function(seedGenerator) {

	this.operations = new StreamOperations();
	this.operations.addOperation(this.operations.SeedOperation(seedGenerator));
};

StreamObject.prototype.close = function() {
	this.end = true;
}

module.exports = StreamObject;
},{"./StreamOperations":4,"./util":6}],4:[function(require,module,exports){
function StreamOperations() {
	this.operations = [];
	this.context;
}

StreamOperations.prototype.setContext = function(context) {
	this.context = context;
}

StreamOperations.prototype.addOperation = function(operation) {
	this.operations.push(operation);
};

StreamOperations.prototype.getLastIndex = function() {
	return this.operations.length - 1;
};

StreamOperations.prototype.next = function() {
	return this.operations[this.getLastIndex()].next();
};

StreamOperations.prototype.SeedOperation = function(seedGenerator) {
	return seedGenerator();
};

StreamOperations.prototype.MapOperation = function(mapFunction, index) {

	var self = this;

	return {
		next: function() {
			var nextVal = self.operations[index - 1].next();

			if (nextVal.done === false) {
				nextVal.value = mapFunction.call(self.context || this, nextVal.value);
			}

			return nextVal;
		}
	}
};

StreamOperations.prototype.FilterOperation = function(filterFunction, index) {

	var self = this;

	return {
		next: function() {
			var nextVal = self.operations[index - 1].next();

			while (nextVal.done === false) {
				if (filterFunction(nextVal.value)) 
					return nextVal;
				
				nextVal = self.operations[index - 1].next();
			}

			return nextVal;
		}
	}
};

StreamOperations.prototype.TakeOperation = function(n, index) {

	var self = this,
		counter = n;

	return {
		next: function() {
			if (counter > 0) {
				var nextVal = self.operations[index - 1].next();
				
				if (nextVal.done === false) {
					counter--;
				}

				return nextVal	;
			}
			
			return {
				done: true,
				value: undefined

			};

		}
	}
};

module.exports = StreamOperations;
},{}],5:[function(require,module,exports){
var StreamObject = require('./StreamObject');

function stream() {
	var so = new StreamObject();
	
	so.addSeedFromCollection(this);
	
	return so;
}

module.exports = stream;
},{"./StreamObject":3}],6:[function(require,module,exports){
function getElementsFromSeed(seed) {

	var accumulator = [],
    	i, length;
    
    if (isArrayLike(seed)) {
      	for (i = 0, length = seed.length; i < length; i++) {
        	accumulator.push(seed[i]);
      	}
    } else {
    	var keys = getObjectKeys(seed);
      	
      	for (i = 0, length = keys.length; i < length; i++) {
        	accumulator.push(seed[keys[i]]);
      	}
    }
    
    return accumulator;
}

function getSeedFunction(seed) {
    var i, length;

    if (isArrayLike(seed)) {
        length = seed.length;

        return function*() {
            for (i = 0; i < length; i++) {
                yield seed[i];
            }
        }
    } else {
        var keys = getObjectKeys(seed);
        length = keys.length

        return function*() {
            for (i = 0; i < length; i++) {
                yield seed[keys[i]];
            }    
        }
    }
}

function getObjectKeys(obj) {
    
    if (!isObject(obj)) 
    	return [];
    
    var keys = [];
    
    for (var key in obj) 
    	if (hasProperty(obj, key)) 
    		keys.push(key);

    return keys;
}

function isObject(obj) {
	var type = typeof obj;
	
	return type === 'function' || type === 'object' && !!obj;
	}

	function isArrayLike(obj) {
		var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	
	function getLength(obj) {
  		return obj == null ? void 0 : obj['length'];
	}

	var length = getLength(obj);

	return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	};

	function hasProperty(obj, key) {
		return obj != null && hasOwnProperty.call(obj, key);
}

module.exports = {
	getElementsFromSeed: getElementsFromSeed,
    getSeedFunction: getSeedFunction
};

},{}]},{},[1]);
