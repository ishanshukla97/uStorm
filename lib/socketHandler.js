var sio = require('../app').sio;
exports.startHandler = function(){
    var maxRoomLimit = 3;
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
            freeChatSpace(socket.chatRoomId);
            socket.broadcast.in(socket.chatRoomId).emit('user disconnected', {name: socket.name});
            console.log(socket.name + ' disoconnected: Space freed');
        });
        
        socket.on('my profile', function(data){
            socket.broadcast.in(socket.chatRoomId).emit('recieve profile', data);
        });
    });
}
