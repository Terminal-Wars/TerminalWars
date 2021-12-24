const http = require('http');
const fs = require('fs');
const mime = require('mime');

console.log("HTTP server started");
http.createServer(function(req, res) {
	let fileName;
	switch(req.url) {
		case "/": 				fileName = "./templates/game.html"; break;
		case "/blank": 			fileName = "./templates/blank"; break;
		case "/favicon.ico": 	fileName = "./static/gfx/logo.ico"; break;
		default: 				fileName = "."+req.url; break;
	}
	fs.access(fileName, (err) => {
		if(err) {
			res.writeHead(404);
			res.end("Resource does not exist.");
		} else {
			res.writeHead(200, {'Content-Type': mime.getType(fileName)});
			const file = fs.createReadStream(fileName);
			file.on('data', (chunk) => {
				res.write(chunk);
			})
			file.on('end', () => {
				res.end();
			});
		}
	});
}).listen(2191);