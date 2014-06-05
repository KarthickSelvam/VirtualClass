/* HTML5 magic
- GeoLocation
- WebSpeech
*/

//WebSpeech API
var final_transcript = '';
var recognizing = false;
var last10messages = []; //to be populated later

if (!('webkitSpeechRecognition' in window)) {
  console.log("webkitSpeechRecognition is not available");
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        $('#msg').addClass("final");
        $('#msg').removeClass("interim");
      } else {
        interim_transcript += event.results[i][0].transcript;
        $("#msg").val(interim_transcript);
        $('#msg').addClass("interim");
        $('#msg').removeClass("final");
      }
    }
    $("#msg").val(final_transcript);
    };
  }

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      recognizing = false;
      $("#start_button").prop("value", "Record");
      return;
    }
    final_transcript = '';
    recognition.lang = "en-GB"
    recognition.start();
    $("#start_button").prop("value", "Recording ... Click to stop.");
    $("#msg").val();
  }
//end of WebSpeech

/*
Functions
*/
function toggleNameForm() {
   $("#login-screen").toggle();
}

function toggleChatWindow() {
 // $("#main-chat-screen").toggle();
   //$("#main-student-screen").toggle();
  $("#main-teacher-screen").toggle();
}

$(document).ready(function() {
  //setup "global" variables first
<<<<<<< HEAD
  socket = io.connect("http://10.98.6.54:3000");
=======
  socket = io.connect("http://10.98.6.69:3000");
>>>>>>> d493693660a771e97eb9d3d4735c96d2cd946c9e
  var myRoomID = null;

  $("form").submit(function(event) {
    event.preventDefault();
  });

  $("#conversation").bind("DOMSubtreeModified",function() {
    $("#conversation").animate({
        scrollTop: $("#conversation")[0].scrollHeight
      });
  });

  $("#main-student-screen").hide();
  $("#main-teacher-screen").hide();
  $("#errors").hide();
  $("#name").focus();
  $("#join").attr('disabled', 'disabled'); 
  
  if ($("#name").val() === "") {
    $("#join").attr('disabled', 'disabled');
  }

  //enter screen
  $("#nameForm").submit(function() {
    var name = $("#name").val();
    var device = "desktop";
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    if (name === "" || name.length < 2) {
      $("#errors").empty();
      $("#errors").append("Please enter a name");
      $("#errors").show();
    } else {
      socket.emit("joinserver", name, device);
      toggleNameForm();
      if(name == "teacher"){
          $("#id_quiz").show();
          $("#role").show();
      }
      else{
          $("#id_quiz").hide();
          $("#role_id").val('123');
      }
      toggleChatWindow();
      $("#msg").focus();
    }
  });

  $("#name").keypress(function(e){
    var name = $("#name").val();
    if(name.length < 2) {
      $("#join").attr('disabled', 'disabled'); 
    } else {
      $("#errors").empty();
      $("#errors").hide();
      $("#join").removeAttr('disabled');
    }
  });

  //main chat screen
<<<<<<< HEAD
  $("#btn-chat").submit(function() {
=======
  $("#btn-chat").click(function() {
>>>>>>> d493693660a771e97eb9d3d4735c96d2cd946c9e
    var msg = $("#msg").val();
    if (msg !== "") {
      socket.emit("send", msg);
      $("#msg").val("");
    }
  });

  //'is typing' message
  var typing = false;
  var timeout = undefined;

  function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
  }

  $("#msg").keypress(function(e){
    if (e.which !== 13) {
      if (typing === false && $("#msg").is(":focus")) {
        typing = true;
        socket.emit("typing", true);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 5000);
      }
    }
  });

  socket.on("isTyping", function(data) {
    if (data.isTyping) {
      if ($("#"+data.person+"").length === 0) {
        $("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i> " + data.person + " is typing.</small></li>");
        timeout = setTimeout(timeoutFunction, 5000);
      }
    } else {
      $("#"+data.person+"").remove();
    }
  });


/*
  $("#msg").keypress(function(){
    if ($("#msg").is(":focus")) {
      if (myRoomID !== null) {
        socket.emit("isTyping");
      }
    } else {
      $("#keyboard").remove();
    }
  });

  socket.on("isTyping", function(data) {
    if (data.typing) {
      if ($("#keyboard").length === 0)
        $("#updates").append("<li id='keyboard'><span class='text-muted'><i class='fa fa-keyboard-o'></i>" + data.person + " is typing.</li>");
    } else {
      socket.emit("clearMessage");
      $("#keyboard").remove();
    }
    console.log(data);
  });
*/

  $("#showCreateRoom").click(function() {
    $("#createRoomForm").toggle();
  });

  $("#createRoomBtn").click(function() {
    var roomExists = false;
    var roomName = $("#createRoomName").val();
    socket.emit("check", roomName, function(data) {
      roomExists = data.result;
       if (roomExists) {
          $("#errors").empty();
          $("#errors").show();
          $("#errors").append("Room <i>" + roomName + "</i> already exists");
        } else {      
        if (roomName.length > 0) { //also check for roomname
          socket.emit("createRoom", roomName);
          $("#errors").empty();
          $("#errors").hide();
          }
        }
    });
  });

  $("#rooms").on('click', '.joinRoomBtn', function() {
    var roomName = $(this).siblings("span").text();
    var roomID = $(this).attr("id");
    socket.emit("joinRoom", roomID);
  });
  
  $("#rooms").on('click', '.removeRoomBtn', function() {
    var roomName = $(this).siblings("span").text();
    var roomID = $(this).attr("id");
    socket.emit("removeRoom", roomID);
    $("#createRoom").show();
  }); 

  $("#leave").click(function() {
    var roomID = myRoomID;
    socket.emit("leaveRoom", roomID);
    $("#createRoom").show();
  });

  $("#people").on('click', '.whisper', function() {
    var name = $(this).siblings("span").text();
    $("#msg").val("w:"+name+":");
    $("#msg").focus();
  });
//socket-y stuff
socket.on("exists", function(data) {
  $("#errors").empty();
  $("#errors").show();
  $("#errors").append(data.msg + " Try <strong>" + data.proposedName + "</strong>");
    toggleNameForm();
    toggleChatWindow();
});

socket.on("joined", function() {
  $("#errors").hide();
  if (navigator.geolocation) { //get lat lon of user
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
  } else {
    $("#errors").show();
    $("#errors").append("Your browser is ancient and it doesn't support GeoLocation.");
  }
  function positionError(e) {
    console.log(e);
  }

  function positionSuccess(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    //consult the yahoo service
    $.ajax({
      type: "GET",
      url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22"+lat+"%2C"+lon+"%22%20and%20gflags%3D%22R%22&format=json",
      dataType: "json",
       success: function(data) {
        socket.emit("countryUpdate", {country: data.query.results.Result.countrycode});
      }
    });
  }
});

socket.on("history", function(data) {
  if (data.length !== 0) {
    $("#msgs").append("<li><strong><span class='text-warning'>Last 10 messages:</li>");
    $.each(data, function(data, msg) {
      $("#msgs").append("<li><span class='text-warning'>" + msg + "</span></li>");
    });
  } else {
    $("#msgs").append("<li><strong><span class='text-warning'>No past messages in this room.</li>");
  }
});

  socket.on("update", function(msg) {
    $("#msgs").append("<li>" + msg + "</li>");
  });

  socket.on("update-people", function(data){
    //var peopleOnline = [];
    $("#people").empty();
    $('#people').append("<li class=\"list-group-item active\">People online <span class=\"badge\">"+data.count+"</span></li>");
    $.each(data.people, function(a, obj) {
      if (!("country" in obj)) {
        html = "";
      } else {
        html = "<img class=\"flag flag-"+obj.country+"\"/>";
      }
      if(name!=obj.name){
        var icon = '<i class=\"fa fa-user\"></i> ';
      if(obj.name=='teacher'){
        var icon = '<i class=\"fa fa-book\"></i> ';
      }
      $('#people').append("<li class=\"list-group-item\">"+ icon +"<span id="+obj.name+">" + obj.name + "</span> <i class=\"fa fa-"+obj.device+"\"></i> " + html + "</li>");
      //peopleOnline.push(obj.name);
    }
    });

    /*var whisper = $("#whisper").prop('checked');
    if (whisper) {
      $("#msg").typeahead({
          local: peopleOnline
      }).each(function() {
         if ($(this).hasClass('input-lg'))
              $(this).prev('.tt-hint').addClass('hint-lg');
      });
    }*/
  });

  socket.on("chat", function(person, msg) {
    $("#msgs").append("<li><strong><span class='text-success'>" + person.name + "</span></strong>: " + msg + "</li>");
    //clear typing field
     $("#"+person.name+"").remove();
     clearTimeout(timeout);
     timeout = setTimeout(timeoutFunction, 0);
  });

  socket.on("whisper", function(person, msg) {
    if (person.name === "You") {
      s = "whisper"
    } else {
      s = "whispers"
    }
    $("#msgs").append("<li><strong><span class='text-muted'>" + person.name + "</span></strong> "+s+": " + msg + "</li>");
  });

  socket.on("roomList", function(data) {   
           alert(name);
    var session = OT.initSession(data.apiKey, data.sessionId);
   session.on("sessionConnected", function (event) {
      var publisherOptions = {width: '100%', height:'100%', name:name};
       // This assumes that there is a DOM element with the ID 'publisher':
       publisher = OT.initPublisher('publisher', publisherOptions);
      session.publish(publisher);
      alert('sessionConnected');
   });
   session.connect(data.token);
   session.on('streamCreated', function(event) {
  //console.log(event);
   //alert('streamCreated');
  if(event.stream.name==="teacher"){
  session.subscribe(event.stream, "publisher", { insertMode: "replace" });
  }else{
      session.subscribe(event.stream, "students", { insertMode: "append" });
  }
});
  });
    socket.on("startParticipant", function(data) {   
    var session = OT.initSession(data.apiKey,data.sessionId);
    
   session.on("sessionConnected", function (event) {
      var publisherOptions = {width: '100%', height:'100%', name:name};
       // This assumes that there is a DOM element with the ID 'publisher':
       publisher = OT.initPublisher('students', publisherOptions);
       console.log(event);
       //alert('sessionConnected');
      session.publish(publisher);
   });
   session.connect(data.token);
   session.on('streamCreated', function(event) {
  console.log(event);
  //alert('streamCreated');
  if(event.stream.name==="teacher"){
  session.subscribe(event.stream, "publisher", { insertMode: "replace" });
  }else{
      session.subscribe(event.stream, "students", { insertMode: "append" });
  }
  });
});



  socket.on("sendRoomID", function(data) {
    myRoomID = data.id;
    alert(data.id);
    $('#roomid').html(data.id);
  });

  socket.on("disconnect", function(){
    $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
    $("#msg").attr("disabled", "disabled");
    $("#send").attr("disabled", "disabled");
  });
  
  $('#sender').click(function() {
            //var user_message = $('#message_box_1').val();
            user_message=1;
            //alert(user_message);
            socket.emit('send_message',{message: user_message});
    });
    
    socket.on("get_message", function(data) {
        $('#data > #question_1').show();
        });
        
     $('#submit-btn').click(function() {
            var user_message = 1;     
            socket.emit('send_answer',{message: user_message});
    });   

        
$('#sender_1').bind("click", function(event) {
            send_msg("sender_1");
    });

    $('#sender_2').bind("click", function(event) {
             send_msg("sender_2");
    });
    
    $('#sender_3').bind("click", function(event) {
            send_msg("sender_1");
    });

    $('#sender_4').bind("click", function(event) {
             send_msg("sender_2");
    });
    
    $('#sender_5').bind("click", function(event) {
             send_msg("sender_2");
    });
    
    function send_msg(data){
           var question_name = $('#'+data).attr("name");
            var myArray = question_name.split('_');
            //alert(question_name);
            $('#myModal').modal('hide');
            socket.emit('send_message',{message: question_name, number:myArray[1]});
    }
    
    
    socket.on("get_message", function(data) {
        data.message = data.message;
        data.number = data.number;
        //alert("result:"+data.message);
        $('#myModal_quiz'+'_'+ data.number).modal({show:true});
        //$('#myModal').click;
        });
        
        
        
    $('#btn-chat').click(function() {
            var user_message = $('#msg').val();
            socket.emit('send_chat',{message: user_message});
    });
    
    socket.on("get_chat", function(data) {
      $('.chat').append('<li>'+data.message+'<li>');
    });
        
     $('#submit-btn_1').click(function() {
        send_answer("submit-btn_1");
    });   

    $('#submit-btn_2').click(function() {
            send_answer("submit-btn_2");
    });
    
      $('#submit-btn_3').click(function() {
        send_answer("submit-btn_3");
    });   

    $('#submit-btn_4').click(function() {
            send_answer("submit-btn_4");
    });
    
    $('#submit-btn_5').click(function() {
            send_answer("submit-btn_5");
    });
    
    
    function send_answer(data){
           var name=$('#'+data).attr("name");
           var myArray = name.split('_');
            var user_message = $('input[name=quiz_'+myArray[1]+']:checked').val(); 
            //alert(user_message); 
            //alert(name);
            $('#myModal_quiz_'+myArray[1]).modal('hide');
            socket.emit('send_answer',{message: user_message,name :name});
    }
    
     socket.on("get_answer", function(person,data) {
            var role = $("#role_id").val();
            //alert(person.name);
            if(role == "teacher"){      
                //alert(role);
            //console.log( person.name + " has been answered");
            var answer=check_answer(data);
            $("#block").show();
            $(this).addClass("active");
            $("#id_quiz").removeClass("active");
            $("#id_home").addClass("active");
            $("#chatblock").hide();
            $("#quiz_block").hide();
            if(answer == "correct"){
              $("#"+person.name).parent().append('<i style="float:right; color:#6C0" class="glyphicon glyphicon-ok fa-fw">');
             }
             else{
                 $("#"+person.name).parent().append('<i style="float:right; color:#C00" class="glyphicon glyphicon-remove fa-fw">');
             }
         }
        });
        
        function check_answer(data){
            var result;
            data.message = data.message;
            data.name=data.name;
            //alert(data.message);
            //alert(data.name);
            
            switch(data.name){
                case "question_1" : if(data.message == 1){
                                        result="correct";
                                    }
                                    else{
                                        result="wrong";
                                    }
                                    break;
                case "question_2" : if(data.message == 2){
                                        result="correct";
                                    }
                                    else{
                                        result="wrong";
                                    }
                                    break;
                case "question_3" : if(data.message == 2){
                                        result="correct";
                                    }
                                    else{
                                        result="wrong";
                                    }
                                    break;
                 case "question_4" : if(data.message == 2){
                                        result="correct";
                                    }
                                    else{
                                        result="wrong";
                                    }
                                    break;
                case "question_5" : if(data.message == 2){
                                        result="correct";
                                    }
                                    else{
                                        result="wrong";
                                    }
                                    break;
            }
            return result;
        }
        });