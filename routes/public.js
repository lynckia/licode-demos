var rooms = require('./../models/roomModel');
var ejs = require('ejs');
var fs = require('fs');
var service = require('./../config').service;
var host = require('./../config').demo_host;
var plain = require('./../config').plain;

exports.index = function(req, res){

	rooms.fetch({id: service.id, key: service.key}, function(){

		var publicRooms = [];

		for (var r in rooms.roomList) {
			if (rooms.roomList[r].data.public) {
				var demo = rooms.roomList[r].data.type;
				var desc = '';
				try	{
					desc = fs.readFileSync('public/demos/' + demo + '/' + demo + '.txt');
				} catch (e) {
					desc = 'Demo room';
				}
				rooms.roomList[r].description = desc;
				publicRooms.push(rooms.roomList[r]);
			}
		}
		var title = 'Licode';
		if (plain) {
			title = 'Demo';
		}
		res.render('index', {title: title, rooms: publicRooms, host: host, plain: plain});

	}, function() {
		
	});

};

exports.room = function(req, res){
	if (req.query.id) {
		rooms.get(req.query.id, {id: service.id, key: service.key}, function(room){

			var demo = room.data.type;
			ejs.renderFile('public/demos/' + demo + '/' + demo + '.html', function(err, body) {
				if (err) {
					body = '';
				}
				var title = 'Licode';
				if (plain) {
					title = 'Demo';
				}
				res.render('demo', {demo: demo, body: body, title: title, plain: plain});
			});
		}, function() {
			res.redirect('/');
		});

	} else {
		res.redirect('/');
	}
};

exports.room_type = function(req, res){
	if (req.query.id) {
		rooms.get(req.query.id, {id: service.id, key: service.key}, function(room){
			res.send(room.data.type);
		}, function() {
			res.send(404);
		});

	} else {
		res.send(404);
	}
};