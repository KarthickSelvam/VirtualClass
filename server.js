var express = require('express')
, app = express()
, OpenTok = require('./lib/opentok')
, server = require('http').createServer(app)
, io = require("socket.io").listen(server)
, uuid = require('node-uuid')
, Room = require('./room.js')
, _ = require('underscore')._;

var apiKey = 44816552,
    apiSecret = '5734c2c21138495a89abbda37b9549406e94556f',
    sessionId='1_MX40NDgxNjU1Mn5-U2F0IE1heSAzMSAwNjo1MjoyNCBQRFQgMjAxNH4wLjgwOTE0MjY1fn4',
    token='T1==cGFydG5lcl9pZD00NDgxNjU1MiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz05YzY1YjYxOGFmNWVkOGNkNThmMjE5ZTI2MzQxODUzNjIyOWRmMDBhOnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9MV9NWDQwTkRneE5qVTFNbjUtVTJGMElFMWhlU0F6TVNBd05qbzFNam95TkNCUVJGUWdNakF4Tkg0d0xqZ3dPVEUwTWpZMWZuNCZjcmVhdGVfdGltZT0xNDAxNTQ0MzUxJm5vbmNlPTAuNTk2OTEwMTI3MzA3NDAyNiZleHBpcmVfdGltZT0xNDAyMTQ5MTM1JmNvbm5lY3Rpb25fZGF0YT0=';
    
if (!apiKey || !apiSecret) {
  console.log('You must specify API_KEY and API_SECRET environment variables');
  process.exit(1);
}
app.configure(function() {
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
  	app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "10.98.5.137");
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public'));
        console.log(__dirname);
	app.use('/components', express.static(__dirname + '/components'));
	app.use('/js', express.static(__dirname + '/js'));
	app.use('/icons', express.static(__dirname + '/icons'));
	app.set('views', __dirname + '/views');
	//app.engine('html', require('ejs').renderFile);
});

app.get('/', function(req, res) {
  res.render('index.html');
});

app.get('/student/:id/:name', function(req, res) {
      
  res.render('student.ejs',{classID: req.params.id ,name: req.params.name});
});
app.get('/teacher/:className/:name', function(req, res) {  
  res.render('teacher.ejs',{className: req.params.className ,name: req.params.name});
});


server.listen(app.get('port'), app.get('ipaddr'), function(){
	console.log('Express server listening on  IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
});

io.set("log level", 1);
var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};

function purge(s, action) {
	if (people[s.id].inroom) { //user is in a room
		var room = rooms[people[s.id].inroom]; //check which room user is in.
		if (s.id === room.owner) { //user in room and owns room
			if (action === "disconnect") {
				io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has left the server. The room is removed and you have been disconnected from it as well.");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete rooms[people[s.id].owns]; //delete the room
				delete people[s.id]; //delete user from people collection
				delete chatHistory[room.name]; //delete the chat history
				sizePeople = _.size(people);
				sizeRooms = _.size(rooms);
				io.sockets.emit("update-people", {people: people, count: sizePeople});
				//io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
				var o = _.findWhere(sockets, {'id': s.id});
				sockets = _.without(sockets, o);
			} else if (action === "removeRoom") { //room owner removes room
				io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has removed the room. The room is removed and you have been disconnected from it as well.");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}
				delete rooms[people[s.id].owns];
				people[s.id].owns = null;
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete chatHistory[room.name]; //delete the chat history
				sizeRooms = _.size(rooms);
				//io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
			} else if (action === "leaveRoom") { //room owner leaves room
				io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has left the room. The room is removed and you have been disconnected from it as well.");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}
				delete rooms[people[s.id].owns];
				people[s.id].owns = null;
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete chatHistory[room.name]; //delete the chat history
				sizeRooms = _.size(rooms);
				//io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
			}
		} else {//user in room but does not own room
			if (action === "disconnect") {
				io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
				if (_.contains((room.people), s.id)) {
					var personIndex = room.people.indexOf(s.id);
					room.people.splice(personIndex, 1);
					s.leave(room.name);
				}
				delete people[s.id];
				sizePeople = _.size(people);
				io.sockets.emit("update-people", {people: people, count: sizePeople});
				var o = _.findWhere(sockets, {'id': s.id});
				sockets = _.without(sockets, o);
			} else if (action === "removeRoom") {
				s.emit("update", "Only the owner can remove a room.");
			} else if (action === "leaveRoom") {
				if (_.contains((room.people), s.id)) {
					var personIndex = room.people.indexOf(s.id);
					room.people.splice(personIndex, 1);
					people[s.id].inroom = null;
					io.sockets.emit("update", people[s.id].name + " has left the room.");
					s.leave(room.name);
				}
			}
		}	
	} else {
		//The user isn't in a room, but maybe he just disconnected, handle the scenario:
		if (action === "disconnect") {
			io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
			delete people[s.id];
			sizePeople = _.size(people);
			io.sockets.emit("update-people", {people: people, count: sizePeople});
			var o = _.findWhere(sockets, {'id': s.id});
			sockets = _.without(sockets, o);
		}		
	}
}

io.sockets.on("connection", function (socket) {

	socket.on("joinserver", function(name, device) {
		var exists = false;
		var ownerRoomID = inRoomID = null;

		_.find(people, function(key,value) {
			if (key.name.toLowerCase() === name.toLowerCase())
				return exists = true;
		});
		if (exists) { //provide unique username:
			var randomNumber=Math.floor(Math.random()*1001)
			do {
				proposedName = name+randomNumber;
				_.find(people, function(key,value) {
					if (key.name.toLowerCase() === proposedName.toLowerCase())
						return exists = true;
				});
			} while (!exists);
			socket.emit("exists", {msg: "The username already exists, please pick another one.", proposedName: proposedName});
		} else {
			people[socket.id] = {"name" : name, "owns" : ownerRoomID, "inroom": inRoomID, "device": device};
			socket.emit("update", "You have connected to the server.");
			io.sockets.emit("update", people[socket.id].name + " is online.")
			sizePeople = _.size(people);
			sizeRooms = _.size(rooms);
			io.sockets.emit("update-people", {people: people, count: sizePeople});
			//socket.emit("roomList", {rooms: rooms, count: sizeRooms});
			socket.emit("joined"); //extra emit for GeoLocation
			sockets.push(socket);
		}
	});

	socket.on("getOnlinePeople", function(fn) {
                fn({people: people});
        });

	socket.on("countryUpdate", function(data) { //we know which country the user is from
		//country = data.country.toLowerCase();
		//people[socket.id].country = country;
		io.sockets.emit("update-people", {people: people, count: sizePeople});
	});

	socket.on("typing", function(data) {
		if (typeof people[socket.id] !== "undefined")
			io.sockets.in(socket.room).emit("isTyping", {isTyping: data, person: people[socket.id].name});
	});
	
	socket.on("send", function(msg) {
		//process.exit(1);
		var re = /^[w]:.*:/;
		var whisper = re.test(msg);
		var whisperStr = msg.split(":");
		var found = false;
		if (whisper) {
			var whisperTo = whisperStr[1];
			var keys = Object.keys(people);
			if (keys.length != 0) {
				for (var i = 0; i<keys.length; i++) {
					if (people[keys[i]].name === whisperTo) {
						var whisperId = keys[i];
						found = true;
						if (socket.id === whisperId) { //can't whisper to ourselves
							socket.emit("update", "You can't whisper to yourself.");
						}
						break;
					} 
				}
			}
			if (found && socket.id !== whisperId) {
				var whisperTo = whisperStr[1];
				var whisperMsg = whisperStr[2];
				socket.emit("whisper", {name: "You"}, whisperMsg);
				io.sockets.socket(whisperId).emit("whisper", people[socket.id], whisperMsg);
			} else {
				socket.emit("update", "Can't find " + whisperTo);
			}
		} else {
			if (io.sockets.manager.roomClients[socket.id]['/'+socket.room] !== undefined ) {
				io.sockets.in(socket.room).emit("chat", people[socket.id], msg);
				socket.emit("isTyping", false);
				if (_.size(chatHistory[socket.room]) > 10) {
					chatHistory[socket.room].splice(0,1);
				} else {
					chatHistory[socket.room].push(people[socket.id].name + ": " + msg);
				}
		    	} else {
				socket.emit("update", "Please connect to a room.");
		    	}
		}
	});
        
    socket.on("askquestion", function() {
		if (io.sockets.manager.roomClients[socket.id]['/'+socket.room] !== undefined ) {
				io.sockets.in(socket.room).emit("showquestion", people[socket.id], msg);
				socket.emit("isTyping", false);
				if (_.size(chatHistory[socket.room]) > 10) {
					chatHistory[socket.room].splice(0,1);
				} else {
					chatHistory[socket.room].push(people[socket.id].name + ": " + msg);
				}
		    	} else {
				socket.emit("update", "Please connect to a room.");
		    	}
	});

	socket.on("disconnect", function() {
		if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the name screen
			purge(socket, "disconnect");
		}
	});

	//Room functions
	socket.on("createRoom", function(name) {
		if (people[socket.id].inroom) {
			socket.emit("update", "You are in a room. Please leave it first to create your own.");
		} else if (!people[socket.id].owns) {
			
                        //var opentok = new OpenTok(apiKey, apiSecret);
                          // Create a session and store it in the express app
                          //opentok.createSession(function(err, session) {
                            //if (err) throw err;
                            //app.set('sessionId', session.sessionId);
                            var id = Math.floor(Math.random() * (200 - 100 + 1)) + 100;;
                            var room = new Room(name, id, socket.id,sessionId);
                            rooms[id] = room;
                            sizeRooms = _.size(rooms);
                            //token = opentok.generateToken(sessionId, { role: 'moderator' });
                            console.log(token);
                            io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms, token:token, apiKey:apiKey,sessionId:sessionId,displayName:people[socket.id].name});
                            //add room to socket, and auto join the creator of the room
                            socket.room = name;
                            socket.join(socket.room);
                            people[socket.id].owns = id;
                            people[socket.id].inroom = id;
                            room.addPerson(socket.id);
                            socket.emit("update", "Welcome to " + room.name + ".");
                            socket.emit("sendRoomID", {id: id});
                            //chatHistory[socket.room] = [];
                            // We will wait on starting the app until this is done
                            //init();
                          //});
			
		} else {
			socket.emit("update", "You have already created a room.");
		}
	});
        
        socket.on("getSession", function(classID) {
		//_.find(rooms, function(key,value) {
                    //console.log(key);
			//if (key.id === classID){
                          //console.log(key);
                          //console.log(classID);
                          //var opentok = new OpenTok(apiKey, apiSecret);
                          //token = opentok.generateToken(key.sessionID, { role: 'publisher' });
                          io.sockets.emit("startParticipant", {token:token,apiKey:apiKey,sessionId:sessionId,displayName:people[socket.id].name});
                  //}
		//});
	});

	socket.on("check", function(name, fn) {
		var match = false;
		_.find(rooms, function(key,value) {
			if (key.name === name)
				return match = true;
		});
		fn({result: match});
	});

	socket.on("removeRoom", function(id) {
		 var room = rooms[id];
		 if (socket.id === room.owner) {
			purge(socket, "removeRoom");
		} else {
                	socket.emit("update", "Only the owner can remove a room.");
		}
	});

	socket.on("joinRoom", function(id) {
		if (typeof people[socket.id] !== "undefined") {
			var room = rooms[id];
			if (socket.id === room.owner) {
				socket.emit("update", "You are the owner of this room and you have already been joined.");
			} else {
				if (_.contains((room.people), socket.id)) {
					socket.emit("update", "You have already joined this room.");
				} else {
					if (people[socket.id].inroom !== null) {
				    		socket.emit("update", "You are already in a room ("+rooms[people[socket.id].inroom].name+"), please leave it first to join another room.");
				    	} else {
						room.addPerson(socket.id);
						people[socket.id].inroom = id;
						socket.room = room.name;
						socket.join(socket.room);
						user = people[socket.id];
						io.sockets.in(socket.room).emit("update", user.name + " has connected to " + room.name + " room.");
						socket.emit("update", "Welcome to " + room.name + ".");
						socket.emit("sendRoomID", {id: id});
						var keys = _.keys(chatHistory);
						if (_.contains(keys, socket.room)) {
							socket.emit("history", chatHistory[socket.room]);
						}
					}
				}
			}
		} else {
			socket.emit("update", "Please enter a valid name first.");
		}
	});

	socket.on("leaveRoom", function(id) {
		var room = rooms[id];
		if (room)
			purge(socket, "leaveRoom");
	});
});

        io.sockets.on("connection", function (socket) {
            socket.on("send_message", function(data) {
              data.message = data.message;
                    socket.broadcast.emit("get_message",data);
            });
        });
        
        io.sockets.on("connection", function (socket) {
            socket.on("send_chat", function(data) {
              data.message = data.message;
                    io.sockets.emit("get_chat",data);
                    //io.socket.in('teacher').emit('new_msg', {msg: 'hello'});
            });
        });
        
        
        io.sockets.on("connection", function (socket) {
            socket.on("send_answer", function(data) {
              data.message = data.message;
                    //io.socket.in('teacher').emit('get_answer', data);
                    io.sockets.emit("get_answer",data);
            });
        });
        
        io.sockets.on("connection", function (socket) {
            socket.on("send_message", function(data) {
              data.message = data.message;
              data.number = data.number;
                    socket.broadcast.emit("get_message",data);
            });
        });
        
        io.sockets.on("connection", function (socket) {
            socket.on("send_chat", function(data) {
              data.message = data.message;
                    io.sockets.emit("get_chat",data);
                    //io.socket.in('teacher').emit('new_msg', {msg: 'hello'});
            });
        });
        
        
        io.sockets.on("connection", function (socket) {
            socket.on("send_answer", function(data) {
              data.message = data.message;
              data.name=data.name;
                    //io.socket.in('teacher').emit('get_answer', data);
                    console.log(people[socket.id]);
                    io.sockets.emit("get_answer",people[socket.id],data);
            });
        });