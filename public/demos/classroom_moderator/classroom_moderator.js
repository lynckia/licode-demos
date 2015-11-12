var localStream, room, teacher;
 
DEMO.init_demo = function (my_name) {

  teacher = getParameterByName('mode') === 'teacher';

  console.log('teacher mode ', teacher)

  if (teacher) {
    localStream = Erizo.Stream({audio: true, video: true, data: true, screen: false, attributes: {name: my_name}});
  } else {
    localStream = Erizo.Stream({audio: true, video: false, data: true, screen: false, attributes: {name: my_name}});
  }

  DEMO.chat_stream = localStream;
  
  DEMO.create_token(my_name, "presenter", function (response) {
    var token = response;
    room = Erizo.Room({token: token});

    localStream.addEventListener("access-accepted", function () {
      var subscribeToStreams = function (streams) {
        for (var index in streams) {
          var stream = streams[index];
          if (localStream.getID() !== stream.getID()) {
            room.subscribe(stream);
          }
        }
      };

      room.addEventListener("room-connected", function (roomEvent) {
        DEMO.connect_to_chat();
        room.publish(localStream);
        subscribeToStreams(roomEvent.streams);
      });

      room.addEventListener("stream-subscribed", function(streamEvent) {
        var stream = streamEvent.stream;

        if (stream.hasVideo()) {
          add_full_button();
          stream.show('screen', {crop: false});
          add_request_button();
        } else {
          add_div_to_grid("test" + stream.getID(), stream.getAttributes().name);
          stream.show("test" + stream.getID(), {speaker: false});
          if (teacher) {
            set_student_clickable(stream); 
          };
        }

        stream.addEventListener("stream-data", function (e) {
          if (e.msg.type === undefined) {
            DEMO.chat_message_received(e);
          } else if (e.msg.type === 'signaling') {
            processRequestMessage(e);
          }
        });
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
          if (stream.hasVideo()) {
            document.getElementById('screen').innerHTML = '';
            restart_state();
          } else {
            remove_div_from_grid(stream.elementID);
          }
        }
      });

      room.connect();

      create_grid();

      if (teacher) {
        localStream.show("screen", {crop: false});

      } else {
        add_waiting_mess();
        add_div_to_grid("localVideo", my_name + ' (me)');
        localStream.stream.getAudioTracks()[0].enabled = false;
        localStream.show("localVideo", {speaker: false});
      }
    });

    localStream.init();
  });
};

var question_status = 'repose';

var processRequestMessage = function (e) {
  console.log('PROCESSSS ', e.stream);
  if (teacher) {
    if (e.msg.action === 'question_request') {
      console.log(' ******************** REQUEST DE ALUMNO ', e.stream.getID());
      add_req_icon(e.stream.getID(), true);
      e.stream.class_status = 'waiting';
    } else if (e.msg.action === 'question_unrequest') {
      console.log(' ******************** REQUEST DE ALUMNO ', e.stream.getID());
      remove_req_icon(e.stream.getID());
      e.stream.class_status = 'repose';
    }

  } else {
    if (e.msg.action === 'start' && e.msg.student === localStream.getID() && question_status !== 'talking') {
      $('#request_button').prop('disabled', true);
      document.getElementById('request_button').innerHTML = 'Mic opened. Make your question';
      $('#request_button').addClass('intermittent');
      localStream.stream.getAudioTracks()[0].enabled = true;
      question_status = 'talking';
    } else if (e.msg.action === 'stop' && e.msg.student === localStream.getID() && question_status === 'talking') {  
      $('#request_button').prop('disabled', false);
      document.getElementById('request_button').innerHTML = 'Request a question';
      $('#request_button').removeClass('intermittent');
      localStream.stream.getAudioTracks()[0].enabled = false;
      question_status ='repose';
    }
  }
};

var add_request_button = function () {
  var b = document.createElement('button');
  b.setAttribute("id", "request_button");
  b.className = 'btn btn-large btn-primary';
  b.setAttribute("style", "margin-left: 270px;width: 275px;height: 60px;");
  b.innerHTML = 'Request a question';

  b.onclick = function () {
    if (question_status === 'repose') {
      b.innerHTML = 'Waiting for teacher permission... Push to cancel the request';
      localStream.sendData({type: 'signaling', action: 'question_request'});
      question_status = 'waiting';
    } else if (question_status === 'waiting') {
      b.innerHTML = 'Request a question';
      localStream.sendData({type: 'signaling', action: 'question_unrequest'});
      question_status = 'repose';
    }
  };

  document.getElementById('container_demo').appendChild(b);
  
};

var set_student_clickable = function (stream) {
  var id = stream.getID();
  stream.class_status = 'waiting'; 
  console.log('STREAM DE ALUMNO **************** ', id);

  document.getElementById("test" + id).onclick = function (e) {
    var status = room.remoteStreams[id].class_status;
    console.log('CLICK', id);
    if (status === 'repose' || status === 'waiting') {
      localStream.sendData({type: 'signaling', action: 'start', student: id});
      add_req_icon(id, false);
      room.remoteStreams[id].class_status = 'talking';
    } else if (status === 'talking') {
      localStream.sendData({type: 'signaling', action: 'stop', student: id});
      remove_req_icon(id);
      room.remoteStreams[id].class_status = 'repose';
    }
  };

};

var add_req_icon = function (id, effect) {

  console.log('PONGOOOOO');

  remove_req_icon(id);

  var i = document.createElement('img');
  i.setAttribute('id', 'req_img_' + id);
  i.setAttribute('style', 'position: absolute;width: 35px;right: 15px;top: 20px;');
  i.src = '/images/audio_req.png';
  if (effect) {
    i.setAttribute('class', 'autozoom');
  } else {
    $('#test' + id).css('background-image', 'url(/images/audio_user_talking.png)');
  }
  i.setAttribute('style', 'position: absolute;width: 35px;right: 15px;top: 20px;');
  document.getElementById('test' + id).appendChild(i);

};

var remove_req_icon = function (id) {
  console.log('QUITO', document.getElementById('req_img_' + id));
  var el = document.getElementById('req_img_' + id);
  if (el != null) {
    el.remove();
  }
  $('#test' + id).css('background-image', 'url(/images/audio_user.png)');
};

var restart_state = function () {
  add_waiting_mess();
  document.getElementById('request_button').remove();
  question_status = 'repose';
};

var add_full_button = function () {

  var b = document.createElement('img');
  b.setAttribute("id", "full_screen_button");
  b.src = "../../images/full_screen.png"
  b.setAttribute("style", "right: 0px; position: absolute; z-index: 1; width: 35px; cursor: pointer;");


  b.onclick = function () {

    var elem = document.getElementById('video_grid');

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else {
      return;
    }

    $('#video_grid').css('width', '99%');
    $('#video_grid').css('height', '100%');
    $('#full_screen_button').css('display', 'none');

    $('#conference_video_grid').css('display', 'none');
    $('#screen').css('height', '100%');

  }

  var fullScreenChanged = function () {

//    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

    if (document.fullscreenElement === null|| document.mozFullScreenElement === null || document.webkitFullscreenElement === null) {
      $('#video_grid').css('width', '');
      $('#video_grid').css('height', '');
      $('#full_screen_button').css('display', '');

      $('#conference_video_grid').css('display', '');
      $('#screen').css('height', '80%');
    }
  }

  $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', fullScreenChanged);

  document.getElementById('screen').appendChild(b);
}

var add_waiting_mess = function () {
    var p = document.createElement('h2');
    p.setAttribute("id", "share_message");
    p.innerHTML = 'Please, wait for the teacher...';
    p.className = "lead";
    p.setAttribute("style", "margin-top: 20%; margin-left: 35%; position: absolute;");
    document.getElementById('screen').appendChild(p);
};

var create_grid = function() {

  var grid = document.getElementById('video_grid');
  var newDiv = document.createElement('div');
  newDiv.className = newDiv.className + " grid_element_border";
  newDiv.setAttribute("id", 'screen');

  var newDiv3 = document.createElement('div');
  newDiv3.setAttribute("id", 'conference_video_grid');

  grid.appendChild(newDiv);  
  grid.appendChild(newDiv3);

  $('#screen').css('text-align', 'center');
  $('#conference_video_grid').css('height', '20%');
  $('#screen').css('height', '80%');
  $('#screen').css('width', '100%');
  $('#screen').css('background-color', 'white');
}

var add_div_to_grid = function(divId, name) {

  //$('#video_grid').css('border', 'none');

  var grid = document.getElementById('conference_video_grid');
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

    var grid = document.getElementById('conference_video_grid');
    grid.removeChild(document.getElementById(divId + '_container'));
    resizeGrid();
}

var resizeGrid = function() {

    var grid = document.getElementById('conference_video_grid');
    var nChilds = grid.childElementCount;

    if (nChilds < 6) {

      var w = 20*nChilds + '%';
      var m = (100-(nChilds*20))/2 + '%';
      
      $('#conference_video_grid').css('width', w);
      $('#conference_video_grid').css('margin-left', m);

      for(var i = 0; i < nChilds; i++) {

          grid.childNodes[i].setAttribute("style", "width: " + 100/nChilds + "%; height: 100%;");

      }
    } else {

      $('#conference_video_grid').css('width', '100%');
      $('#conference_video_grid').css('margin-left', '0');

      for(var i = 0; i < nChilds; i++) {

          grid.childNodes[i].setAttribute("style", "width: " + 100/nChilds + "%; height: 100%;");

      }


    }
} 

var getParameterByName = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
