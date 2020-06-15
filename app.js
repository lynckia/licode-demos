var express = require('express');
//var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var morgan = require('morgan')
var errorhandler = require('errorhandler')
var compression = require('compression')
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
app.set('port', config.http_port || 80);
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

app.use(cookieSession({
    keys: ['asdaggftyuoplfgd']
}));
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression())
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

app.get('/', public.index);
app.get('/room', public.room);
app.get('/roomtype', public.room_type);
app.post('/token', rest.createToken);


app.get('/admin/login', admin.login);
app.post('/admin/login', admin.login);
app.get('/admin', admin.auth, admin.admin);
app.post('/admin/rooms', admin.auth, rest.createRoom);
// Fake delete
app.get('/admin/rooms/:room', admin.auth, rest.deleteRoom);
app.get('/admin/logout', admin.logout);

app.get('/room_spy', admin.auth, public.spy_room);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

if (config.https) {

    var options = {
        key: fs.readFileSync('cert/key.pem').toString(),
        cert: fs.readFileSync('cert/cert.pem').toString()
    };

    if (config.ca_certs) {
        options.ca = [];
        for (var ca in config.ca_certs) {
            options.ca.push(fs.readFileSync('cert/' + config.ca_certs[ca]).toString());
        }
    }
    var server = https.createServer(options, app);
    server.listen(config.https_port || 443);
}
