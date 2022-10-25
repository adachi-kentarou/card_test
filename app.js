const https = require('http');
const fs = require('fs');
const path = require('path');
var url = require('url');

const port = process.env.PORT || 3001;

const Canvas = require('canvas');//npm i canvas
 
const canvas = Canvas.createCanvas(1920, 1080);

//Ref: https://qiita.com/hachisukansw/items/633d1bf6baf008e82847
function hsvToRgb(H,S,V) {
  //https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
 
  var C = V * S;
  var Hp = H / 60;
  var X = C * (1 - Math.abs(Hp % 2 - 1));
 
  var R, G, B;
  if (0 <= Hp && Hp < 1) {[R,G,B]=[C,X,0]};
  if (1 <= Hp && Hp < 2) {[R,G,B]=[X,C,0]};
  if (2 <= Hp && Hp < 3) {[R,G,B]=[0,C,X]};
  if (3 <= Hp && Hp < 4) {[R,G,B]=[0,X,C]};
  if (4 <= Hp && Hp < 5) {[R,G,B]=[X,0,C]};
  if (5 <= Hp && Hp < 6) {[R,G,B]=[C,0,X]};
 
  var m = V - C;
  [R, G, B] = [R+m, G+m, B+m];
 
  R = Math.floor(R * 255);
  G = Math.floor(G * 255);
  B = Math.floor(B * 255);
 
  return 'rgb(' + [R ,G, B].join(",") + ')';
}


const server = https.createServer(function(req,res){
	
	var filePath = '.' + req.url.split("?")[0];
    if (filePath == './') {
        filePath = './index.html';
    }
	else if (filePath == './imgtest')
	{
		//動的画像生成
		var url_parse = url.parse(req.url, true);
		//if (Object.keys(url_parse.query).length != 0)
		{
			if (Object.keys(url_parse.query).length == 0)
			{
				console.log(url_parse);
				url_parse.query = {id:"FF0000"};
			}
			
			//getパラメータ処理
			var color = url_parse.query.id.toUpperCase();
			var r = parseInt(color.substr(0,2),16);
			var g　= parseInt(color.substr(2,2),16);
			var b = parseInt(color.substr(4,2),16);
			
			var ctx = canvas.getContext('2d');
			 
			// 四角形描画
			ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';  //RGBで入力するとき
			//ctx.fillStyle = hsvToRgb(34, 0.71, 1);  //HSVで入力するとき
			ctx.fillRect(0, 0, 1920, 1080);　　//塗りつぶす
			 
			// Base64で出力も行うとき
			// var base64 = canvas.toDataURL("image/png");
			// console.log(base64);
			 
			const buffer = canvas.toBuffer('image/png')

			
			
			res.writeHead(200, { 'Content-Type': 'image/png' });
			res.end(buffer, 'utf-8');
			
			return;
		
		}
	}
		

    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    var contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT') {
                fs.readFile('./404.html', function(error, content) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            }
            else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            }
        }
        else {
			if(contentType == "text/html")
			{
				console.log(content);
				var html = Buffer.from(content, 'base64').toString();
				html = html.replace('****', 'aaaaaaaaa');
				content = Buffer.from(html).toString('utf-8');
			}
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
	
});
server.listen(port);