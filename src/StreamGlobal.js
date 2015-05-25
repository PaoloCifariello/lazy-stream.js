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

			while (typeof nextValue !== 'undefined') {
				yield nextValue;
				nextValue = seedFunction();
			}
		}

		so.addSeedFromFunction(seedGenerator)
		
		return so;

	}
}

module.exports = GlobalStream;