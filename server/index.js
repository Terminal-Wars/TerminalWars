const http = require('http');
const fs = require('fs');
const mime = require('mime');
(async () => {
	http.createServer(function(req, res) {
		let fileName;
		switch(req.url) {
			case "/": 				fileName = "./templates/game.html"; break;
			case "/favicon.ico": 	fileName = "./static/gfx/logo.ico"; break;
			default: 				fileName = "."+req.url; break;
		}
		let headerType = `'Content-Type': ${mime.getType(fileName)}`;
		res.writeHead(200, {headerType});
		const file = fs.createReadStream(fileName);
		file.on('data', (chunk) => {
			res.write(chunk);
		})
		file.on('end', () => {
			res.end();
		});
	}).listen(2191);
})();
