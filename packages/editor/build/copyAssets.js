import copy from "recursive-copy";

var options = {
	overwrite: true,
	// expand: true,
	// dot: true,
	// junk: true,
	// filter: [
	// 	'**/*',
	// 	'!.htpasswd'
	// ],
	// rename: function(filePath) {
	// 	return filePath + '.orig';
	// },
	// transform: function(src, dest, stats) {
	// 	if (path.extname(src) !== '.txt') { return null; }
	// 	return through(function(chunk, enc, done)  {
	// 		var output = chunk.toString().toUpperCase();
	// 		done(null, output);
	// 	});
	// }
};

copy('./src/assets', './dist/assets', options)