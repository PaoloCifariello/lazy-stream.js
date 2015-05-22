var StreamOperations = require('./StreamOperations'),
	util = require('./util');

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

StreamObject.prototype.anyMatch = function (anyMatchPredicate) {
	
	var nextValue = this.operations.getNext();

	while (nextValue !== null) {
	
		if (anyMatchPredicate(nextValue))
			return true;

		nextValue = this.operations.getNext();
	} 
	
	return false;
};

StreamObject.prototype.allMatch = function (allMatchPredicate) {
	
	var nextValue = this.operations.getNext();

	while (nextValue !== null) {
	
		if (!allMatchPredicate(nextValue))
			return false;

		nextValue = this.operations.getNext();
	}

	return true;
};


StreamObject.prototype.addSeedFromCollection = function(seed) {
	
	var seedElements = util.getElementsFromSeed(seed),
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

module.exports = StreamObject;