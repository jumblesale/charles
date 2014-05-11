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
	port = 16217,

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

	if(!image) {
		console.log('Could not find any images!!');
	}

	console.log('Displaying image: %s', image);

	return image;
};

http.createServer(function (req, res) {

	var host = req.headers.host,
		url = req.url,
		imagePattern = /^\/pug\/([^\/]+)$/,
		matches = imagePattern.exec(url),
		dir = opts.dir,
		output, image;

	if(matches) {
		// serve a single image
		var file = matches[1];
		if(fs.existsSync(path.join(dir, file))) {
			res.writeHead(200, {'Content-Type': 'image/JPEG'});
			image = path.join(opts.dir, file);
			output = fs.readFileSync(image);
			console.log('Displaying image: %s', image);
			res.end(output);
			return;
		} else {
			console.log('%s not found', file);
			res.writeHead(404);
			res.end('404');
			return;
		}
	}

	if(/^\/random[\/]?$/.test(url)) {
		// serve json
		res.writeHead(200, {'Content-Type': 'application/JSON'});
		image = 'http://' + host + '/pug/' + randomImage(dir);
		output = JSON.stringify({pug: image});
		res.end(output);
		console.log('Providing JSON for %s', image);
		return;
	}

	res.writeHead(200, {'Content-Type': 'image/JPEG'});
	res.end(fs.readFileSync(path.join(opts.dir, randomImage(dir))));
}).listen(port, '0.0.0.0');

console.log('Listening on port %s', port);