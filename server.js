// Import express and path modules.
var express = require( "express");
var session = require('express-session');
var path = require( "path");
// Create the express app.
var app = express();
// Define the static folder.
app.use(express.static(path.join(__dirname, "./static")));
app.use(session({secret: 'rangersleadtheway'}));  // string for encryption
// Setup ejs templating and define the views folder.
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// Root route to render the index.ejs view.
app.get('/', function(req, res) {
    if(!session['users']){
        session['users']={};
        session['messages']={};
        session['msg_id']=0;
    };
 res.render("index");
})
var server = app.listen(8000, function() {
    console.log("listening on port 8000");
});
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    console.log("Client/socket is connected!");
    console.log("Client/socket id is: ", socket.id);
    // all the server socket code goes in here
    socket.on( "add_new_user", function (data){
        var new_id = socket.id;
        session.users[new_id] = data.name;
        console.log("Users:", session.users);
        var room_string = '';
        var user_string = '';
        user_string = "<div class='d-inline-block border border-dark fader' id='" + new_id + "' style='width: 200px; height: 200px; background-color: white'><p class='d-inline-block text-center' style='width: 200px; height: 50px; background-color: grey'>" + session.users[new_id] + "</p></div>";
        console.log(user_string);
        for(var key in session.users) {
            console.log(key, session.users[key]);
            room_string += "<div class='d-inline-block border border-dark fader' id='" + key + "' style='width: 200px; height: 200px; background-color: white'><p class='d-inline-block text-center' style='width: 200px; height: 50px; background-color: grey'>" + session.users[key] + "</p></div>";
        };
        socket.emit( 'create_room', room_string);
        // socket.broadcast.emit('update_room', msg_string);
    })
    socket.on( "add_new_msg", function(data){
        var msg_string = '';
        var msg_id = socket.id;
        var msg_name = session.users[msg_id];
        msg_num += 1;
        session.messages[msg_num] = [msg_name, data.message]
        console.log(msg_id, msg_name, date.message);
        msg_string = "<dl class='row d-inline-block' id='" + msg_num + "'><dt class='col-sm-4 d-inline'>" + msg_name + ":</dt><dd class='col-md-12 d-inline'>" + data.message + "</dd></dl>";
        socket.emit('update_room', msg_string);
        socket.broadcast.emit('update_room', msg_string);
    });
    socket.on( "disconnect", function (){
        delete session.users[socket.id];
        socket.broadcast.emit('left_room', socket.id);
    });
})
  
