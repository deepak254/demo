
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
   , fs = require('fs')
  , user = require('./routes/user')
  , http = require('http')
  ,request = require("request")
 ,  jf = require('jsonfile')
 ,  util = require('util')
  , path = require('path');

var app = express();
var mongoose = require('mongoose');
// all environments
var db = mongoose.connect('mongodb://localhost/mcafee');
var schema = mongoose.Schema({key : JSON});
//var db = mongoose.connect('mongodb://localhost/mcafee');


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}




app.get('/', routes.index);
app.get('/users', user.list);



var url = 'http://mcafee.0x10.info/api/app?type=json';
var documents='';


request({
    url: url,
    json: false
}, function (error, response, body) {
	
	
    if (!error && response.statusCode === 200) {
    	var destination = fs.createWriteStream('./sampleData.json');
    	var jsonObj = JSON.parse(body);
    	//console.log(jsonObj.length);
    	console.log(jsonObj);
    	
        var Json = mongoose.model('JSON', schema);
        toSave = new Json({key : jsonObj});
    	
        toSave.save(function(err){
            'use strict';
            if (err) {
                throw err;
          }
          console.log('woo!');
       });
    	request(url).pipe(destination);
    	console.log('file created SuccessFully');
    	
    	// Print the json response
    	
    }
});



app.get('/getalldocuments',function(req,res){
	
	 var file = './sampleData.json'
		jf.readFile(file, function(err, obj) {
		  console.log(util.inspect(obj))
		  res.render('index',{
			  Products:obj
		  })
     })
	
})

app.get('/show',function(req,res){
	
	var Json = mongoose.model('JSON', schema);
	Json.find(function(err,products){
		if(err){res.send('not found');}
		res.send(products);
	})
});
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
