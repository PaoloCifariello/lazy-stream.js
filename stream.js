(function () {
	var StreamGlobal = {
		fromRange: function(from, to) {
			var so = new StreamObject();

			so.addSeedFromFunction(function() {
				if (from < to) 
					return from++;

				return null;
			});

			return so;
		},

		fromFunction: function(seedFunction) {
			var so = new StreamObject();

			so.addSeedFromFunction(seedFunction)
			
			return so;

		}
	}

	function stream() {
		var so = new StreamObject(this);
		
		so.addSeedFromCollection(this);
		
		return so;
	}


	function StreamOperations() {
		this.operations = [];
		this.context;

		this.setContext = function(context) {
			this.context = context;
		}

		this.addOperation = function(operation) {
			this.operations.push(operation);
		};

		this.getLastIndex = function() {
			return this.operations.length - 1;
		};

		this.getNext = function() {
			return this.operations[this.getLastIndex()].get();
		}

		this.SeedOperation = function(seedFunction) {
			
			return {
				get: seedFunction	
			}
		};

		this.MapOperation = function(mapFunction, index) {

			var self = this;

			return {
				get: function() {
					var value = self.operations[index - 1].get();

					if (value === null)
						return null;

					return mapFunction.call(self.context || this, value)
				}
			}
		};



		this.FilterOperation = function(filterFunction, index) {

			var self = this;

			return {
				get: function() {
					var value = self.operations[index - 1].get();

					while (value !== null) {
						if (filterFunction(value)) 
							return value;
						else
							value = self.operations[index - 1].get();
					}

					return null

				}
			}
		};

		this.TakeOperation = function(n, index) {

			var self = this,
				counter = n;

			return {
				get: function() {
					if (counter > 0) {
						var value = self.operations[index - 1].get();
						
						counter--;

						return value;
					}
					
					return null

				}
			}
		};

		this.FoldlOperation = function(foldlFunction, index) {

			var self = this,
				counter = n;

			return {
				get: function() {
					if (counter > 0) {
						var value = self.operations[index - 1].get();
						
						counter--;

						return value;
					}
					
					return null

				}
			}
		};
	}

	/* Stream object for simple variables */
	function StreamObject() {}

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

		if (nextValue === null) 
			return base;

		return arguments.callee.call(this, foldlFunction, foldlFunction(base, nextValue));
	};


	StreamObject.prototype.foldr = function (foldrFunction, base) {
		
		var nextValue = this.operations.getNext();

		if (nextValue === null) 
			return base;

		return foldrFunction(nextValue, arguments.callee.call(this, foldrFunction, base));
	};


	StreamObject.prototype.getNext = function () {
		return this.operations.getNext();
	};

	StreamObject.prototype.getAll = function() {

		var values = [];

		while (true) {
			
			var value = this.getNext();

			if (value !== null) 
				values.push(value);
			else
				return values;
		}
	};

	StreamObject.prototype.addSeedFromCollection = function(seed) {
		
		var seedElements = getElementsFromSeed(seed),
			i = 0;

		function seedFunction() {
			if (i >= seedElements.length)
				return null;

			return seedElements[i++];
		};

		this.addSeedFromFunction(seedFunction);
		this.operations.setContext(seed);
	};

	StreamObject.prototype.addSeedFromFunction = function(seedFunction) {

		this.operations = new StreamOperations();
		this.operations.addOperation(this.operations.SeedOperation(seedFunction));
	};

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

	global.Stream = global.Stream || StreamGlobal;
	Object.prototype.stream = Object.prototype.stream || stream;
})()