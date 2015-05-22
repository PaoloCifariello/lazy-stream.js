var StreamGlobal = require('./src/StreamGlobal'),
	stream = require('./src/stream');

global.Stream = global.Stream || StreamGlobal;
Object.prototype.stream = Object.prototype.stream || stream;