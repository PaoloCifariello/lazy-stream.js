/*
 * @name lazy-stream.js
 *
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.stream = factory();
  }
})(this, function() {

    /** StreamOperations contains the list of operations pending */
    function StreamOperations(generator, context) {
        this.operations = [generator()];
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

    /** A Stream is a StreamObject */
    function StreamObject(seedGenerator, context) {
        this.end = false;
        this.operations = new StreamOperations(seedGenerator, context);
    }

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

    /** Final operations */
    StreamObject.prototype.foldl = function (foldlFunction, base) {  
        var nextValue = this.operations.next();

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

    StreamObject.prototype.forEach = function (forEachFunction) {
        var nextValue = this.operations.next();

        while (nextValue.done === false) {
            forEachFunction(nextValue.value);
            nextValue = this.operations.next();
        }

        this.close();
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

    StreamObject.prototype.close = function() {
        this.end = true;
    }

    /** Check if obj is an Object */
    function isObject(obj) {
        var type = typeof obj;      
        return type === 'function' || type === 'object' && !!obj;
    }

    /** Check if obj is an Array */
    function isArrayLike(obj) {
        var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
        var length = obj == null ? void 0 : obj['length'];

        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    }

    /** void generator */
    function* identity() { }

    /** gets a generator for elements contained in source */
    function getSeedFromSource(source) {
        let seed = identity;

        if (isArrayLike(source)) {
            seed = function*() {
                for (let i = 0; i < source.length; i++) {
                    yield source[i];
                }
            };
        } else if (isObject(source)) {
            seed = function* () {
                for (let k in source) {
                    yield source[k];
                }
            };
        }
        
        return seed;
    }

    /** stream from a collection */
    function stream(source) {
        let seedGenerator = getSeedFromSource(source);
        return new StreamObject(seedGenerator, source);
    }

    /** stream version */
    stream.VERSION = '0.0.8';

    /** creates a generator for the range */
    stream.range = function(from, to) {
		function* seedGenerator() {
			while (from < to){
				yield from++;
			}
		}

		return new StreamObject(seedGenerator);
	};

    /** creates a generator from a function */
	stream.function = function(seedFunction) {
		function* seedGenerator (){
			var nextValue = seedFunction();

			while (nextValue != undefined) {
				yield nextValue;
				nextValue = seedFunction();
			}
		}

		return new StreamObject(seedGenerator);
	};

    return stream;
});