var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var socketioJwt = require('socketio-jwt');
var socketIo = require('socket.io');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var sio = socketIo.listen(server);
var jwtSecret = 'cat';

sio.set('authorization', socketioJwt.authorize({
  secret: jwtSecret,
  handshake: true
}));

//exporting for the use of socketHandler.js
//exports.sio = sio;
//Require socketHandler and start the handling connections
//var socketHandler = require('./lib/socketHandler');
//socketHandler.startHandler();
/* *************************************************************************************
 * *************************************Socket Handler**********************************
 */
var maxRoomLimit = 5;
var chatRooms = [{  id: '0',
                    spaceLeft: maxRoomLimit}];    

function getEmptyRoom(){
    for(var i=0, l=chatRooms.length; i<l; i++){
        if(chatRooms[i].spaceLeft > 0){
            return i;
        }//if
    }//for
    //no rooms empty create a new chatroom
    console.log('no empty chat room');
    return getNewChatroom();
}//getEmptyRooms()

function getNewChatroom(){
    var id = chatRooms.length;
    var idString = id.toString();
    var l = chatRooms.push({   id: idString,
                               spaceLeft: maxRoomLimit});
    return --l;
}//getNewChatroom

function updateChatRoom(i){
    console.log('updateChatRoom\n\tchatRooms[' + i + '].spaceLeft: ' + chatRooms[i].spaceLeft);
    --chatRooms[i].spaceLeft;
}//updateChatRoom()

function freeChatSpace(i){
    console.log('freeChatSpace\n\tchatRooms[' + i + '].spaceLeft' + chatRooms[i].spaceLeft);
    ++chatRooms[i].spaceLeft;
}//freeChatSpace()

sio.sockets.on('connect', function(socket){
    socket.on('join room', function(data){
        socket.name = data.name;
        socket.chatRoomId = getEmptyRoom();
        
        console.log('ChatRoom ID: ' + socket.chatRoomId);
        socket.join(chatRooms[socket.chatRoomId].id);
        updateChatRoom(socket.chatRoomId);
        socket.broadcast.in(socket.chatRoomId).emit('user joined', data);
        console.log('connected to:' + socket.chatRoomId);
        console.log('Loggin username ', data.name);
    });


    socket.on('new message', function(data){
        console.log(socket.name, data.message);
        socket.broadcast.in(socket.chatRoomId).emit('new message', {name: socket.name,
                                             message: data.message});
    });

    socket.on('disconnect', function(){
        
        if(!(socket.chatRoomId == undefined)){
            console.log('Disconnection before freeChatSpace(): ' + socket.chatRoomId);
            //freeChatSpace(chatRooms, socket.chatRoomId);
            ++chatRooms[socket.chatRoomId].spaceLeft;
            socket.broadcast.in(socket.chatRoomId).emit('user disconnected', {name: socket.name});
            console.log(socket.name + ' disoconnected: Space freed');
        }
    });

    socket.on('my profile', function(data){
        socket.broadcast.in(socket.chatRoomId).emit('recieve profile', data);
    });
});
/* ************************************Socket Handler END********************************
 * **************************************************************************************
 */



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/chat', expressJwt({   secret: jwtSecret    }));
app.use('/profile', expressJwt({secret: jwtSecret    }));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {});
  });
}

// production error handler
// no stacktraces leaked to user

app.use(function(err, req, res, next) {
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = {app: app, server: server};
