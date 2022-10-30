const https = require('http');
const fs = require('fs');
const path = require('path');

var url = require('url');

//const loadEncoder = require("mp4-h264");
const loadEncoder = require("./mp4-h264/mp4-encoder.node.js");
const port = process.env.PORT || 3001;


const {
  createCanvas,
  registerFont,
  loadImage,
  Canvas,
  Image,
  NodeCanvasRenderingContext2D,
} = require('canvas');//npm i canvas
 
registerFont('./font/GenShinGothic-Bold.ttf', { family: 'GenShinGothic-Bold' });

const canvas = createCanvas(100, 100);
const canvas2 = createCanvas(200, 200);

const AsyncLock = require('async-lock');
const lock = new AsyncLock();

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

const image = new Image();
image.src = './test.jpg';  // ここはURLでも良い（loadImageと一緒）

const server = https.createServer(async function(req,res){
	
	var color = "000000";
	
	var filePath = '.' + req.url.split("?")[0];
    
	if (filePath == './') {
        filePath = './index.html';
    }
	else if (/^\.\/[A-Z0-9]{6}$/.test(filePath) == true)
	{
		
		color = filePath.match(/[A-Z0-9]{6}/)[0];
		filePath = './index.html';
	}
	else if (filePath == './sample.mp4')
	{

		let ctx2 = canvas2.getContext('2d');
		 
		console.log("mp4");
		//動的動画生成
		// 四角形描画
		ctx2.fillStyle = 'rgba(0, 0, 64, 0.1)';  //RGBで入力するとき
		ctx2.fillRect(0, 0, 100, 100);　　//塗りつぶす
		
		ctx2.fillStyle = 'rgba(255,0,0,1)';
		ctx2.textAlign = 'left';
		ctx2.font = '20px "GenShinGothic-Bold"';  // フォントサイズとさっき指定したフォント名
		/*
		(async () => {
			const Encoder = await loadEncoder();

			// Create a new encoder interface
			let encoder = Encoder.create({
			width: 100,
			height: 100,
			fps: 30
			});
			
			var str = "";
			for (var i = 0; i < 10; i++)
			{
				//画像加工
				ctx.fillText(str, 0, 50);
				str += i;
				
				//画像作製
				
				let rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data
				encoder.encodeRGB(rgba);
			}
			
			//const buffer = encoder.end();
			let mp4 = Buffer.from(encoder.end()).toString('base64');
			res.writeHead(200, { 'Content-Type': 'video/mp4' });
			res.end(mp4, 'utf-8');
		})();
		*/
		
		// Create a new encoder interface
		const Encoder = await loadEncoder();
		let encoder = Encoder.create({
		width: 100,
		height: 100,
		fps: 30
		});
		
		let str = "";
		for (let i = 0; i < 10; i++)
		{
			//画像加工
			ctx2.fillText(str, 0, 50);
			str += i;
			
			//画像作製
			
			let rgba = ctx2.getImageData(0, 0, canvas2.width, canvas2.height).data
			encoder.encodeRGB(rgba);
		
		}
		
		let data = encoder.memory();
		//const buffer = encoder.end();
		
		
		let mp4 = Buffer.from(data).toString('base64');
		
		mp4 = 'data:video/mp4;base64,' + mp4;
		
		res.writeHead(200, { 'Content-Type': 'video/mp4' });
		res.end(mp4, 'utf-8');
		
		return;
	}
	else if (/^\.\/img\/[A-Z0-9]{6}$/.test(filePath) == true)
	{
		//動的画像生成
		var url_parse = url.parse(req.url, true);
		//if (Object.keys(url_parse.query).length != 0)
		{
			
			//パラメータ処理
			color = filePath.match(/[A-Z0-9]{6}/)[0];
			var r = parseInt(color.substr(0,2),16);
			var g　= parseInt(color.substr(2,2),16);
			var b = parseInt(color.substr(4,2),16);
			
			var ctx = canvas.getContext('2d');
			 
			// 四角形描画
			ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.1)';  //RGBで入力するとき
			//ctx.fillStyle = hsvToRgb(34, 0.71, 1);  //HSVで入力するとき
			ctx.fillRect(0, 0, 100, 100);　　//塗りつぶす
			
			//ctx.drawImage(image, 0, 0, 6400, 4800);  // さっき作ったCanvasの(0, 0)地点に640x480のサイズで描画
			ctx.fillStyle = 'rgba(255,0,0,1)';
			ctx.textAlign = 'left';
			ctx.font = '20px "GenShinGothic-Bold"';  // フォントサイズとさっき指定したフォント名
			
			var str = "";
				for (var i = 0; i < 10; i++)
				{
					//画像加工
					ctx.fillText(str, 0, 50);
					str += i;
					
					//画像作製
					/*
					const dataURL = canvas.toDataURL("image/jpeg", 0.75);
					const imageBase64 = dataURL.split(',')[1];
					const decodeURL = Buffer.from(imageBase64, 'base64').toString();//atob( imageBase64 );
					const buffer = new Uint8Array(decodeURL.length);
					for( let i = 0 ; i < decodeURL.length ; i ++)
						buffer[i] = decodeURL.charCodeAt(i);
					*/
					//const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data
					//encoder.encodeRGB(rgba);
					//for( let i = 0 ; i < decodeURL.length ; i ++)
					//	buffer[i] = decodeURL.charCodeAt(i);
				}	
			/*
			(async () => {
				const Encoder = await loadEncoder();

				// Create a new encoder interface
				const encoder = Encoder.create({
				width: 100,
				height: 100,
				fps: 30
				});
				
				
				const mp4 = encoder.end();
				  
				// Optionally convert to URL for <video> tag, download, etc...
				//const url = URL.createObjectURL(new Blob([mp4], { type: "video/mp4" }));
			})();
			*/
			
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

    fs.readFile(filePath,async function(error, content) {
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
				
				var html = Buffer.from(content, 'base64').toString();
				
				html = html.replace(/hogehoge/g, color);
				
				///////////////////////////////////
				let ctx2 = canvas2.getContext('2d');
				 
				//動的動画生成
				// 四角形描画
				ctx2.fillStyle = 'rgba(64, 128, 256, 1)';  //RGBで入力するとき
				ctx2.fillRect(0, 0, 200, 200);　　//塗りつぶす
				
				ctx2.fillStyle = 'rgba(255,0,0,1)';
				ctx2.textAlign = 'left';
				ctx2.font = '20px "GenShinGothic-Bold"';  // フォントサイズとさっき指定したフォント名
				
				const Encoder = await loadEncoder();
				let encoder = Encoder.create({
				width: 200,
				height: 200,
				fps: 30
				});
				
				let str = "";
				for (let i = 0; i < 20; i++)
				{
					//画像加工
					ctx2.fillText(str, 0, 100);
					str += i;
					
					//画像作製
					
					let rgba = ctx2.getImageData(0, 0, canvas2.width, canvas2.height).data
					encoder.encodeRGB(rgba);
				
				}
				
				let data = encoder.end();
				//const buffer = encoder.end();
				
				
				let mp4 = Buffer.from(data).toString('base64');
				
				mp4 = 'data:video/mp4;base64,' + mp4;
				
				html = html.replace(/xxxx/g, mp4);
				
				//////////////////////////////////
				
				content = Buffer.from(html).toString('utf-8');
			}
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
	
});
server.listen(port);
