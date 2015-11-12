var N = require('./nuve');
var nuveHost = require('./../config').nuve_host;

exports.roomList = {};

exports.fetch = function(auth, callback, error) {

	N.API.init(auth.id, auth.key, nuveHost);
	N.API.getRooms(function(rooms) {
		exports.roomList = JSON.parse(rooms);
		callback();
	}, function() {
		error();		
	});

	
};

exports.get = function(roomId, auth, callback, error) {

	N.API.init(auth.id, auth.key, nuveHost);
	N.API.getRoom(roomId, function(room) {
		callback(JSON.parse(room));
	}, function() {
		error();		
	});

	
};

exports.create = function(roomName, data, p2p, auth, callback, error) {

	N.API.init(auth.id, auth.key, nuveHost);
	N.API.createRoom(roomName, function(rooms) {
		callback();
	}, function() {
		error();		
	}, {data: data, p2p: p2p});
};

exports.delete = function(roomId, auth, callback, error) {

	N.API.init(auth.id, auth.key, nuveHost);

	N.API.deleteRoom(roomId, function(rooms) {
		callback();
	}, function() {
		error();		
	});

	
};