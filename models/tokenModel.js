var N = require('./nuve');
var nuveHost = require('./../config').nuve_host;

exports.create = function(roomId, username, role, auth, callback, error) {
	N.API.init(auth.id, auth.key, nuveHost);
	N.API.createToken(roomId, username, role, callback, error);
};