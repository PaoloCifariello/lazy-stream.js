(function () {
	global.Stream = global.Stream || new StreamGlobal();
	Object.prototype.stream = Object.prototype.stream || stream; 

	function stream() {
		return new StreamObject(this);
	}

	function StreamGlobal() {

	}

	function StreamOperations(seed) {
		this.operations = [];
		this.seed = seed;

		this.addOperation = function(operation) {
			this.operations.push(operation);
		};

		this.getLastIndex = function() {
			return this.operations.length - 1;
		};

		this.getNext = function() {
			return this.operations[this.getLastIndex()].get();
		}

		this.SeedOperation = function(seed) {
		
			var seedElements = getElementsFromSeed(seed),
				i = 0;

			return {
				get: function() {
					if (i >= seedElements.length)
						return null;

					return seedElements[i++];
				}	
			}
		};

		this.MapOperation = function(mapFunction, index) {

			var self = this;

			return {
				get: function() {
					var value = self.operations[index - 1].get();

					if (value === null)
						return null;

					return mapFunction.call(seed, value)
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
	}

	/* Stream object for simple variables */
	function StreamObject(seed) {
		this.operations = new StreamOperations(seed);

		this.operations.addOperation(this.operations.SeedOperation(seed));
		
		this.seed = seed;


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

	StreamObject.prototype.iterate = function(nIterations) {


		return this;
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
})()