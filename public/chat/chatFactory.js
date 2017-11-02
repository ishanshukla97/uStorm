angular.module('chatApp')
.factory('chatFactory', function($location, $window){
    //local declarations
    var name = $window.sessionStorage.validName;
    var factory = {};
    factory.userList = [];
    
    var socket = io.connect('', {
        query: 'token=' + $window.sessionStorage.token,
        'forceNew': true
    });
    
    
    //helper functions to handle socket connections
        socket.on('connect', function(){
            var my_data = {
                name: name,
                interest: $window.sessionStorage.interest,
                hobbies: $window.sessionStorage.hobbies,
                expertise: $window.sessionStorage.expertise,
                isCollapsed: true
            };
            
            //Join a room
            socket.emit('join room', my_data);

            //on newMessage
            socket
            .on('new message', function(data){
                messageAppender(data.name, data.message);
            })
            .on('user disconnected', function(data){
                //Delete user from userList
                for(i=0; i<factory.userList.length; i=i+1){
                    if(factory.userList[i].name == data.name){
                        factory.userList.splice(i, 1);
                        break;
                    }
                }
            })
            .on('user joined', function(data){
                factory.userList.push(data);
                send_myProfile();
            })
            .on('recieve profile', function(data){
                //check if the broadcasted user profile is already present in userList
                //If not then push it, else don't.
                var isPresent = false;
                for(i=0; i<factory.userList.length; i=i+1){
                    if(factory.userList[i].name == data.name 
                       && factory.userList[i].expertise == data.expertise){
                        isPresent = true;
                        break;
                    }
                }
                if(!isPresent){
                    factory.userList.push(data);
                }
            });

            factory.exitRoom = function(){
                socket.emit('disconnect', { name: name });
                socket.disconnect();
            };

            function send_myProfile(){
                socket.emit('my profile', my_data);
            }
        });
    
    factory.sendMessage = function(message){
        var data = {    name: name, message: message    };
        messageAppender('You', message);
        socket.emit('new message', data);
    };
    
    function messageAppender(name, message){
        //Get Element from html and append message with name
        if(name == 'You'){
            $('#chatlist-appender').append("<li class='this-chat-bubble'><h5>You:</h5><span>" + message + "</span></li>");
        }
        else{
            $('#chatlist-appender').append("<li class='other-chat-bubble'><h5>" + name + "</h5><span>" + message +"</span></li>");
        }
    }
    
    function removeOneError(){
        //This error persist when userList (Array of objs) length is initialized to 1,
        //Removing this error by popping empty obj on initialization
        factory.userList.pop();
    }
    
    return factory;
});

