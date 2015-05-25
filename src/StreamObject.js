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

	if (nextValue.done === false)
		return nextValue.value;
};

StreamObject.prototype.getAll = function() {

	var values = [],
		nextValue = this.operations.next();

	while (nextValue.done === false) {
		values.push(nextValue.value);
		nextValue = this.operations.next();
	}

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

module.exports = StreamObject;