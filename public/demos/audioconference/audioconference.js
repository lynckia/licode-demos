var localStream, room;

DEMO.init_demo = function (my_name) {

  localStream = Erizo.Stream({audio: true, video: false, data: true, attributes: {name: my_name}});
  DEMO.chat_stream = localStream;
  
  DEMO.create_token(my_name, "presenter", function (response) {
    var token = response;
    console.log(token);
    room = Erizo.Room({token: token});

    localStream.addEventListener("access-accepted", function () {
      var subscribeToStreams = function (streams) {
        for (var index in streams) {
          var stream = streams[index];
          if (localStream.getID() !== stream.getID()) {
            room.subscribe(stream, {audio:true, video: false});
          }
        }
      };

      room.addEventListener("room-connected", function (roomEvent) {
        DEMO.connect_to_chat();
        console.log('vopy a pub');
        room.publish(localStream);
        subscribeToStreams(roomEvent.streams);
      });

      room.addEventListener("stream-subscribed", function(streamEvent) {
        var stream = streamEvent.stream;

        add_div_to_grid("test" + stream.getID(), stream.getAttributes().name)
        stream.play("test" + stream.getID());

        stream.addEventListener("stream-data", DEMO.chat_message_received);
        DEMO.add_chat_participant(stream.getAttributes().name, stream.getID());

      });

      room.addEventListener("stream-added", function (streamEvent) {
        var streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
      });

      room.addEventListener("stream-removed", function (streamEvent) {
        // Remove stream from DOM
        var stream = streamEvent.stream;
        if (stream.elementID !== undefined) {
          DEMO.remove_chat_participant(stream.getAttributes().name, stream.getID());
          remove_div_from_grid(stream.elementID, "video_grid");
        }
      });

      room.connect();

      add_div_to_grid("localVideo", my_name + ' (me)');
      localStream.play("localVideo");

    });
    localStream.init();
  });
};

var add_div_to_grid = function(divId, name) {

    $('#video_grid').css('border', 'none');

    var grid = document.getElementById('video_grid');
    var newDiv = document.createElement('div');
    newDiv.setAttribute("id", divId + '_container');
    newDiv.className = newDiv.className + " grid_element_border";

    var newDiv2 = document.createElement('div');
    newDiv2.setAttribute("id", divId);
    newDiv2.className = newDiv2.className + " grid_element";
    newDiv.appendChild(newDiv2);

    newDiv2.setAttribute("style", "background-image: url(../../images/audio_user.png); background-position: center; background-repeat: no-repeat; background-color: white; background-size: contain;");

    var p = document.createElement('h5');
    p.innerHTML = name;
    p.setAttribute("style", "position: absolute; padding-left: 10px");
    newDiv.appendChild(p);

    grid.appendChild(newDiv);   
    resizeGrid('video_grid');
}

var remove_div_from_grid = function(divId) {

    var grid = document.getElementById('video_grid');
    grid.removeChild(document.getElementById(divId + '_container'));
    resizeGrid('video_grid');
}

var resizeGrid = function() {

    var grid = document.getElementById('video_grid');
    var nChilds = grid.childElementCount;

    var c = Math.floor((nChilds-1)/3);
    var r = (nChilds-1) % 3;

    if (nChilds === 1) {
        grid.childNodes[1].setAttribute("style", "width: 100%; height: 100%;");
    } else {

        var height = 100/(c+1);
        
        for(var i = 1; i <= nChilds; i++) {

            var row = Math.floor((i-1) / 3);
            var width = 100/3;

            if (r === 0) {  // las dos últimas filas tienen dos vídeos

                if (row > c - 2) { 
                    width = 50;
                }
                grid.childNodes[i].setAttribute("style", "width: " + width + "%; height: " + height + "%;");

            } else if (r === 1) {  // la última fila tiene un vídeo
                if (row === c) { 
                    width = 50;
                }
                grid.childNodes[i].setAttribute("style", "width: " + width + "%; height: " + height + "%;");

            } else {
                grid.childNodes[i].setAttribute("style", "width: " + width + "%; height: " + height + "%;");
            }
        }
    }
} 
