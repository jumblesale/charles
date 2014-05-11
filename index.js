#!/usr/bin/env nodejs

var opts = require('nomnom')
	.option('dir', {
		abbr: 'd',
		help: 'The directory containing images',
		required: true,
	})
	.parse(),

	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	_ = require('underscore'),

	formats = ['jpg', 'jpeg', 'png'],

	image;

console.log('Reading files from %s ...', opts.dir);

randomImage = function(imageDir) {
	var images = _.filter(fs.readdirSync(imageDir), function(file) {
			var pattern = /^.+\.(.+)$/,
				matches = pattern.exec(file),
				extension;
			if(!matches) {
				return false;
			}
			extension = matches[1];
			return _.contains(formats, matches[1]);
		}),

		image = (function(images) {
			var length = images.length,
				rand = Math.floor((Math.random() * length) + 1);
			return images[rand];
		})(images);

	console.log('Displaying image: %s', image);

	return fs.readFileSync(path.join(imageDir, image));
};

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'image/JPEG'});
	res.end(randomImage(opts.dir));
}).listen(16217, '127.0.0.1');