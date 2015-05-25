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

StreamOperations.prototype.getNext = function() {
	return this.operations[this.getLastIndex()].get();
}

StreamOperations.prototype.SeedOperation = function(seedFunction) {
	
	return {
		get: seedFunction	
	}
};

StreamOperations.prototype.MapOperation = function(mapFunction, index) {

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



StreamOperations.prototype.FilterOperation = function(filterFunction, index) {

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

StreamOperations.prototype.TakeOperation = function(n, index) {

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

module.exports = StreamOperations;