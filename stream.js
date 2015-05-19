(function () {
	global.Stream = global.Stream || new StreamGlobal();
	Object.prototype.stream = Object.prototype.stream || stream; 

	function stream() {
		return new StreamObject(this);
	}

	function StreamGlobal() {

	}


	/* Stream object for simple variables */
	function StreamObject(seed) {
		var operations = [];
		
		this.seedElements = getElementsFromSeed(seed);
		this.seed = seed;
	}

	StreamObject.prototype.map = function(mapFunction) {

		var newAccumulator = [];

		this.seedElements.forEach(function(el) {
			newAccumulator.push(mapFunction.call(this.seed, el));
		});

		this.seedElements = newAccumulator;

		return this;
	};

	StreamObject.prototype.filter = function(filterFunction) {

		var newAccumulator = [];

		this.seedElements.forEach(function(el) {
			if (filterFunction.call(this.seed, el))
				newAccumulator.push(el);
		});

		this.seedElements = newAccumulator;

		return this;
	};

	StreamObject.prototype.iterate = function() {


		return this;
	};

	StreamObject.prototype.getNext = function () {

	};

	StreamObject.prototype.getAll = function() {
		return this.seedElements;
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