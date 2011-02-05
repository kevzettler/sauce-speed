var soda = require('soda')
		,http = require('http')
		;
		
http.createServer(function(req, res){

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("<h1>Speed Compare...</h1>");

	var browser = soda.createSauceClient({
		"url": 'http://www.facebook.com',
		'username' : '',
		'access-key' : '',
		'os' : 'Windows 2003',
		'browser': 'firefox',
		'job-name': 'speed-test_closure-20_push_no_wait'
	});
	
	var images = [];
	
	function screenShots(){
		console.log("calling screenshots");
		return function(browser){
			for(var i=0; i<13; i++){ (function(i){
				browser.captureScreenshotToString(function(data){
					images.push(data);
				});
			})(i)}
		}
	}
	
	function loginToFB(){
		return function(browser){
			browser.type("email", "")
		  .type("pass", "")
		  .click('//input[@value="Login"]')
		  .waitForPageToLoad("30000")
		}
	}
	
	function renderImages(cb){
		res.write("<ul>");
		for(var i = 0; i<images.length; i++){
			console.log("writing an image!");
			res.write('<li style="display:block;float:left;"><img src="data:image/png;base64,'+images[i]+'" alt="'+i+'"/ height="100" width="100"></li>');
		}
		res.write("</ul>");
		return cb();
	}

	browser
		.chain
		.session()
		.setTimeout(5000)
		.setContext("sauce: disable log")
		.open('/')
		.and(loginToFB())
	  .click("//div[@id='bookmarks_menu']/div/ul/li[1]/a/span[4]")
		.waitForPageToLoad()
		.and(screenShots())
		.open('/')
		.waitForPageToLoad(5000)
		.click("//div[@id='bookmarks_menu']/div/ul/li[2]/a/span[4]")
		.waitForPageToLoad()
		.and(screenShots())
		.end(function(err, body, sauce_res, result){
			if(err) throw err;
			//var imageData = new Buffer(body, 'base64').toString('binary');
			//var imageData = body;
			
			//console.log("image data",imageData);
			
			console.log("about to render images", images.length);
			renderImages(function(){
				console.log("render images callback");
				res.end();
			});
		});
	
	
	
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124');