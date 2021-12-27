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

	fs.stat(fileName, (err, stats) => {
		if(err || fileName.startsWith("./server")) {
				res.writeHead(404);
				res.end("Resource does not exist.");
		}
		else if(stats.isDirectory()) {
			fs.readdir(fileName, (err, files) => {
				if(err) {
					res.writeHead(500);
					res.end(err);
				} else {
					res.writeHead(200);
					for(let n in files) res.write(files[n]+"\n");
					res.end();
				}
			})
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