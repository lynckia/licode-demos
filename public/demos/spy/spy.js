var localStream, room;

DEMO.init_demo = function (my_name) {

  var screen = getParameterByName("screen");
  L_SESSION.displayed = {};

  DEMO.create_token(my_name, "presenter", function (response) {
    var token = response;
    console.log(token);
    room = Erizo.Room({token: token});

    $( window ).resize(function (){
      L_SESSION.resizeGrid();
    });

    var subscribeToStreams = function (streams) {
      for (var index in streams) {
        var stream = streams[index];
        room.subscribe(stream);
      }
    };

    room.addEventListener("room-connected", function (roomEvent) {
      subscribeToStreams(roomEvent.streams);
    });

    room.addEventListener("stream-subscribed", function(streamEvent) {
      var stream = streamEvent.stream;
      L_SESSION.add_div_to_grid('video' + stream.getID(), 'main');
      stream.play('video' + stream.getID());
      L_SESSION.displayed[stream.getID()] = stream;
    });

    room.addEventListener("stream-added", function (streamEvent) {
      var streams = [];
      streams.push(streamEvent.stream);
      subscribeToStreams(streams);
    });

    room.addEventListener("stream-removed", function (streamEvent) {
      // Remove stream from DOM

      var stream = streamEvent.stream;
      console.log('remooooooooooo', stream.elementID);
      if (stream.elementID !== undefined) {
        L_SESSION.remove_div_from_grid(stream.elementID);
      }
      L_SESSION.remove_participant(stream.getID());
      delete L_SESSION.displayed[stream.elementID];

    });

    room.connect();
  });
};