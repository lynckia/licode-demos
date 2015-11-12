var rooms = require('./../models/roomModel');
var tokens = require('./../models/tokenModel');
var service = require('./../config').service;

exports.createToken = function(req, res){
    var roomId = req.body.roomId;
    var username = req.body.username;
    var role = req.body.role;
	tokens.create(roomId, username, role, {id: service.id, key: service.key}, function(token){
		res.send(token);
	}, function(e) {	
		console.log('nonon ', e);
		res.send(e);
	});
};

exports.createRoom = function(req, res) {

	var p2p = false;
	if (req.body.p2p) {
		p2p = true;
	}
	var data = {type: req.body.type};
	if (req.body.public) {
		data.public = true;
	} else {
		data.public = false;
	}
	rooms.create(req.body.name, data, p2p, {id: req.session.id, key: req.session.key}, function(){

		console.log('deleted');
		res.redirect('/admin');

	}, function() {
		req.session = null;
		res.redirect('/admin/login');
	});
};

exports.deleteRoom = function(req, res) {

	rooms.delete(req.params.room, {id: req.session.id, key: req.session.key}, function(){

		console.log('deleted');
		res.redirect('/admin');

	}, function() {
		req.session = null;
		res.redirect('/admin/login');
	});
	
};