var StreamObject = require('./StreamObject');

var GlobalStream = 
{
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

module.exports = GlobalStream;