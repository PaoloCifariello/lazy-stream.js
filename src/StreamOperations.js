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