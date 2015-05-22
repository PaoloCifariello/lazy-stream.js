var StreamObject = require('./StreamObject');

function stream() {
	var so = new StreamObject();
	
	so.addSeedFromCollection(this);
	
	return so;
}

module.exports = stream;