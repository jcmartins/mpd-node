var mm = require('musicmetadata');
var player = require('./player');
var fs = require('fs');
var async = require('async');
var express = require('express');
var app = express();

var music;

var result =[]; //metadata array
var pictures =[]; // metadata photos 

var interator = function(file,callback){

	var stream = fs.createReadStream( __dirname + '/musics/'+ file);
	var parser = new mm(stream);

	//listen for the metadata event
	parser.on('metadata', function (meta) {
		pictures.push(meta.picture[0].data.toString('base64'));
		meta.picture[0].data = undefined;
		meta.file = file;
		result.push(meta);  // add element in array result

	});

	parser.on('done', function(err){
		if (err)
			throw err;
		stream.destroy();
		callback();

	});

};

fs.readdir( __dirname + '/musics', function(err,files){
	if (err)
		throw err;
	async.eachSeries(files, interator, function(err){    
	   if (err)
			throw err;		
	});
});

app.use(express.static(__dirname + '/view/bower_components'));

app.get('/', function(req, res){
	res.sendfile(__dirname + '/view/index.html'); 
});

app.get('/play/:index', function(req, res){
	if (music)
		music.stop();
	music = new player(__dirname + '/musics/' + result[req.params.index].file);	
	res.end();
});

app.get('/pause', function(req, res){
	music.pause();
	res.end();
});

app.get('/resume', function(req, res){
	music.resume();
	res.end();
});

app.get('/stop', function(req, res){
	music.stop();
	res.end();
});

app.get('/list', function(req, res){
	res.json(result);
});

app.get('/picture/:index', function(req, res){
	res.setHeader('Content-Type', 'image/jpg');
	if(!pictures[req.params.index])
		return res.end();	
	res.write(new Buffer(pictures[req.params.index], 'base64'));
	res.end();8
});

app.listen(3000);

