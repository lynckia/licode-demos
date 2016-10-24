var L_SESSION = {};

L_SESSION.createToken = function(userName, role, callback) {

	my_name = userName;

	var success = function (data) {
		callback(data);
	}

	$.ajax({
		type: "POST",
		url: '/tokens/',
		data: {roomId: room_info.id, username: userName, role: role},
		success: success
	});

};

var add_text_to_chat = function(text, style, me) {
	if (me) style += ' chat_name_me';
	var p = '<p class="chat_' + style + '">' + text + '</p>';
    $('#chat_content').append(p);
    $('#chat_content')[0].scrollTop = $('#chat_content')[0].scrollHeight;
}


L_SESSION.send_chat_message = function() {
    if($('#chat_write')[0].value.match (/\S/)) {
        if (L_SESSION.data_stream) {
            L_SESSION.data_stream.sendData({msg: $('#chat_write')[0].value, name: my_name, type: "chat"});
        }
        L_SESSION.chat_message_received({msg: $('#chat_write')[0].value, name: my_name}, true);
    }
    $('#chat_write')[0].value = '';
};

L_SESSION.chat_message_received = function(data, me) {
	if (!me && !onchat) {
		$('#chat_unread').removeClass('hidden');
		unread_mess++;
		$('#chat_unread').text(unread_mess);
	}

	if (last_name !== data.name) {
		add_text_to_chat(data.name, 'name', me);
		last_name = data.name;
	}
	var date = new Date();
	var hour = date.getHours();
	var minutes = date.getMinutes();
	if ((hour + '').length === 1) hour = '0' + hour;
	if ((minutes + '').length === 1) minutes = '0' + minutes;
	var text = '<span class="chat_date">' + hour + ':' + minutes + '</span> ' + data.msg;
	add_text_to_chat(text, 'msg');
};

L_SESSION.remove_participant = function (id) {
	$('#user_info_' + id).remove();
};

var add_div_to_mini_grid = function(divId) {

    var grid = document.getElementById('mini_video_layout');

    var newDiv = document.createElement('div');
    newDiv.setAttribute("id", divId);
    newDiv.className = newDiv.className + " mini_video";

    grid.appendChild(newDiv);
};

var add_div_to_main_grid = function(divId) {

    var grid = document.getElementById('video_layout');

    var newDiv = document.createElement('div');
    newDiv.setAttribute("id", divId);
    //newDiv.className = newDiv.className + " grid_element";

    grid.appendChild(newDiv);   
    L_SESSION.resizeGrid();
};

// grid: main/mini
L_SESSION.add_div_to_grid = function(divId, grid) {

	if (grid === 'mini') {
		add_div_to_mini_grid(divId);
	} else if (grid === 'main') {
		add_div_to_main_grid(divId);
	} else if (fullScreen === true) {
		add_div_to_mini_grid(divId);
	} else {
		add_div_to_main_grid(divId);
	}
};

L_SESSION.remove_div_from_grid = function(divId, grid) {
    try {
      var grid = document.getElementById('video_layout');
      grid.removeChild(document.getElementById(divId));
      L_SESSION.resizeGrid();
    } catch(error) {}

    try {
      var grid = document.getElementById('mini_video_layout');
      grid.removeChild(document.getElementById(divId));
    } catch(error) {}
};

var remove_all_divs = function () {
	$('#video_layout').empty();
	$('#mini_video_layout').empty();
};

L_SESSION.resizeGrid = function() {

	//trace( ++contador + " : layout para tamano:" + this.width + " x " + this.height);
    var grid = document.getElementById('video_layout');

    var width = grid.offsetWidth;
    var height = grid.offsetHeight;
    if (width < 100) {
      width = 780;
    }
    if (height < 100) {
      height = 560;
    }
    var _ratio = 4/3;
    var GAP = 75;
    var _mantain = true;
    var _halign = "center";
    var _valign = "center";

    var factor = width / height;
    var vids = grid.childElementCount;
                    
    var rows = 0;
    var cols = 0; 
    var rowsaux = 0;
    var colsaux = 0;
    
    var chw = 0;
    var chh = 0;
    var chwaux = 0;
    var chhaux = 0;  
    var area = 0;
    var areaaux = 0;
    
    
    for ( var j = 1; j <= vids; j++ )
    {
      colsaux = j;
      rowsaux = Math.ceil(vids / colsaux);              
      
      chwaux = (width-GAP*colsaux) / colsaux;
      chhaux = (height-GAP*rowsaux) / rowsaux;
      
      if (chwaux > _ratio*chhaux)
      {
        chwaux = _ratio*chhaux;
      }
      else
      {
        chhaux = chwaux/_ratio;
      }
      
      areaaux = vids*chhaux*chwaux;
      
      if ( areaaux > area )
      {
        chw  = chwaux;
        chh  = chhaux;
        cols = colsaux;
        rows = rowsaux;
        area = areaaux;
      }
    }
    
      for ( var i = 0; i < vids; i++)
    {
      var ch = grid.childNodes[i];
      var col = i%cols;
      var row = Math.floor(i/(cols));
      var chwidth = 0;
      var chheight = 0;
      var chx = 0;
      var chy = 0;
      var rcols = cols;
      if (row === rows-1) {
        rcols = cols-(cols*rows-vids);
      }
      
      
      if ( _mantain === true ) {
        chwidth = chw;
        chheight = chh;
      }
      else {
        chwidth = (width-GAP*cols) / cols;
        chheight = (height-GAP*rows) / rows;
      }

      var halign = 0;
      var valign = 0;

      switch (_halign)
      {
        case "left":
          halign = 0;
          break;
        case "right":
          halign = (width/cols - chwidth);
          break;
        case "center":
          halign = (width/rcols - chwidth)/2;
          break;
      }

      switch (_valign)
      {
        case "top":
          valign = 0;
          break;
        case "bottom":
          valign = (height/rows - chheight);
          break;
        case "center":
          valign = (height/rows - chheight)/2;
          break;
      }

      chx = col*((width) / rcols) + halign;
      chy = row*((height)/ rows) + valign;
      ch.setAttribute("style", "position: absolute; width: " + chwidth + "px; height: " + chheight + "px; left: " + chx + "px; top: " + chy + "px");

      resizeRemotes();

    }
};

var resizeRemotes = function () {
	var remoteStreams = L_SESSION.displayed;
	if (remoteStreams) {
		for (var r in remoteStreams) {
			if ((remoteStreams[r].hasVideo() || remoteStreams[r].hasScreen()) && remoteStreams[r].showing) {
				remoteStreams[r].player.resize();
			}
		}
	}
}

L_SESSION.fullScreen = function (id, fixed) {
	fullScreen = true;
	remove_all_divs();
	var remoteStreams = L_SESSION.displayed;
	for (var r in remoteStreams) {
		console.log(remoteStreams[r].getID(), id);
		if (remoteStreams[r].getID() === id) {
			L_SESSION.add_div_to_grid(remoteStreams[r].getID(), 'main');
			remoteStreams[r].play(remoteStreams[r].getID());
			L_SESSION.rewriteBar(remoteStreams[r].getID(), remoteStreams[r].getAttributes().name, false, true, fixed);
		}

		if (remoteStreams[r].getID() !== id && L_SESSION.localStream.getID() !== remoteStreams[r].getID()) {
			L_SESSION.add_div_to_grid(remoteStreams[r].getID(), 'mini');
			remoteStreams[r].play(remoteStreams[r].getID());
			L_SESSION.rewriteBar(remoteStreams[r].getID(), undefined, undefined, undefined, fixed);
		}
	}


	resizeRemotes();
}

L_SESSION.regularScreen = function (fixed) {
	fullScreen = false;
	remove_all_divs();
	var remoteStreams = L_SESSION.displayed;
	for (var r in remoteStreams) {
		var stream = remoteStreams[r];
		if (L_SESSION.localStream.getID() !== remoteStreams[r].getID()) {
			if (stream.hasScreen() && L_SESSION.screens_always_in_mini) {
				L_SESSION.add_div_to_grid(stream.getID(), 'mini');
				stream.play(stream.getID());
				L_SESSION.rewriteBar(stream.getID(), undefined, undefined, undefined, fixed);
			} else {
				L_SESSION.add_div_to_grid(stream.getID());
				stream.play(stream.getID());
				L_SESSION.rewriteBar(stream.getID(), stream.getAttributes().name, undefined, undefined, fixed);
			}
			
		}
	}


	resizeRemotes();
}

L_SESSION.switchVideo = function (id) {
	var muted;
	if ($('#camera_' + id).hasClass('fa-play')) {
		muted = true;
		$('#camera_' + id).removeClass('fa-play');
		$('#camera_' + id).addClass('fa-stop');
		$('#muted_' + id).css('display', 'none')
	} else {
		muted = false;
		$('#camera_' + id).removeClass('fa-stop');
		$('#camera_' + id).addClass('fa-play');
		$('#muted_' + id).css('display', 'block')
	}

	if (id === undefined) {
		if (muted) L_SESSION.localStream.stream.getVideoTracks()[0].enabled = true;
		else L_SESSION.localStream.stream.getVideoTracks()[0].enabled = false;

		var attributes = L_SESSION.localStream.getAttributes();
		attributes.video_muted = !muted;
		L_SESSION.localStream.setAttributes(attributes);
	} else {
		if (muted) L_SESSION.displayed[id].stream.getVideoTracks()[0].enabled = true;
		else L_SESSION.displayed[id].stream.getVideoTracks()[0].enabled = false;
	}
}

L_SESSION.switchAudio = function (id) {
	var muted;
	if ($('#audio_' + id).hasClass('fa-volume-off')) {
		muted = true;
		$('#audio_' + id).removeClass('fa-volume-off');
		$('#audio_' + id).addClass('fa-volume-up');
	} else {
		muted = false;
		$('#audio_' + id).removeClass('fa-volume-up');
		$('#audio_' + id).addClass('fa-volume-off');
	}

	if (muted) L_SESSION.localStream.stream.getAudioTracks()[0].enabled = true;
	else L_SESSION.localStream.stream.getAudioTracks()[0].enabled = false;

	var attributes = L_SESSION.localStream.getAttributes();
	attributes.audio_muted = !muted;
	L_SESSION.localStream.setAttributes(attributes);
}

L_SESSION.shareDesktop = function () {
	if (L_SESSION.screenSharing) {
		L_SESSION.screenSharing = false;
		L_SESSION.room.unpublish(L_SESSION.screenStream);
		$('#share_desktop span').html('Share desktop');
	} else {
		if (L_SESSION.screenSharing_available) {
			L_SESSION.screenStream.init();
		}
	}
}

L_SESSION.rewriteBar = function (id, username, local, full, fixed) {

	//$('#player_' + id).append('<img id="muted_' + id + '" class="muted_icon hidden" src="/images/no_camera_icon.svg"></img>');

	$('#player_' + id).append('<svg id="muted_' + id + '" class="muted_icon"' + 
		' version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' + 
     	' viewBox="0 0 91.1 88.1" enable-background="new 0 0 91.1 88.1" xml:space="preserve">' + 
		'<g>' + 
    		'<path d="M35.5,29.2c-3.2,0-5.7,2.6-5.7,5.7V48l18.8-18.8H35.5z"/>' + 
    		'<path d="M64.7,29.9c-0.2-0.1-0.3-0.1-0.5-0.1c-0.3,0-0.7,0.1-0.9,0.4l-8,8v-2.4l6.4-6.4c0.4-0.4,0.4-1,0-1.4L59.8,26' +
        		'c-0.4-0.4-1-0.4-1.4,0L26.6,57.8c-0.4,0.4-0.4,1,0,1.4l1.9,1.9c0.4,0.4,1,0.4,1.4,0l6.5-6.5h13.2c3.2,0,5.7-2.6,5.7-5.7v-3.3l8,8' +
        		'c0.2,0.3,0.6,0.4,0.9,0.4c0.2,0,0.3,0,0.5-0.1c0.5-0.2,0.8-0.7,0.8-1.2V31.1C65.5,30.6,65.2,30.1,64.7,29.9z"/>' + 
		'</g>' + 
	'</svg>');

	$('#subbar_' + id).addClass('subbar');
	$('#subbar_' + id).find('a').remove();

	$('#subbar_' + id).find('div').addClass('speaker');
	$('#subbar_' + id).find('div').addClass('bar_tool');

	if (username) $('#subbar_' + id).append('<p class="username_lab">' + username + '</p>');
	
	$('#subbar_' + id).append('<i id="camera_' + id + '" class="fa fa-pause bar_tool"></i>');
	$('#camera_' + id).click(function () {
		L_SESSION.switchVideo(id);
	});
	
	if (!local) { 
		if (full) {
			$('#subbar_' + id).append('<i id="expand_' + id + '" class="fa fa-compress bar_tool"></i>');
			$('#expand_' + id).click(function () {
				L_SESSION.regularScreen(fixed);
			});
		} else {
			$('#subbar_' + id).append('<i id="expand_' + id + '" class="fa fa-expand bar_tool"></i>');
			$('#expand_' + id).click(function () {
				L_SESSION.fullScreen(id, fixed);
			});
		}
	}

	if (local) {
		$('#subbar_' + id).find('.speaker').remove();
		$('#subbar_' + id).append('<i id="audio_' + id + '" class="fa fa-volume-up bar_tool"></i>');
		$('#audio_' + id).click(function () {
			L_SESSION.switchAudio();
		});
	}

	if (fixed) {

		$('#player_' + id)[0].onmouseover = undefined;
		$('#player_' + id)[0].onmouseout = undefined;
		
		L_SESSION.displayed[id].player.bar.display();
	}
}