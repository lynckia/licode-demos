var express = require('express');
var public = require('./routes/public');
var admin = require('./routes/admin');
var rest = require('./routes/rest');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require("fs");
var config = require('./config')

var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    "use strict";
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'HEAD, PUT, POST, GET, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'origin, content-type');
    if (req.method == 'OPTIONS') {
        console.log("CORS request");
        res.statusCode = 200;
        res.header('Content-Length', '0');
        res.send();
        res.end();
    }
    else {
        next();
    }
});

app.use(express.cookieParser('asdaggftyuoplfgd'));
app.use(express.cookieSession());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', public.index);
app.get('/room', public.room);
app.get('/roomtype', public.room_type);
app.post('/token', rest.createToken);

app.all('/admin/login', admin.login);

app.all('/admin', admin.auth);

app.get('/admin', admin.admin);
app.post('/admin/rooms', rest.createRoom);
// Fake delete
app.get('/admin/rooms/:room', rest.deleteRoom);
app.get('/admin/logout', admin.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

if (config.https) {

    var options = {
        key: fs.readFileSync('cert/key.pem').toString(),
        cert: fs.readFileSync('cert/cert.pem').toString()
    };
    var server = https.createServer(options, app);
    server.listen(443);
}
