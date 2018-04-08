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
        session['msg_num']=0;
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
        //Build chat window
        var room_string = '';
        room_string += "<h3><u>Ninja Talk...</u></h3><div class='d-inline-block border border-dark w-100 p-3' style='height: 600px;' id='chat_win'></div><form class='posting_form' method='post'><div class='form-group mx-auto'><input type='text' placeholder='enter message here...' class='form-control w-100 p-3' id='message' name='message'><input type='hidden' id='userid' name='userid'><input type='submit' class='btn btn-outline-primary btn-lg' value='Send'></div></form>";
        socket.emit( 'create_room', room_string);

        // add joined message
        var data_msg = "joined the talk"
        session['msg_num'] += 1;
        session.messages[session.msg_num] = [data.name, data_msg];
        msg_string = add_msg(session['msg_num'], data.name, data_msg);
        socket.broadcast.emit('update_room', msg_string);

        //build messages in chat window
        for(var key in session.messages) {
            console.log(key, session.messages[key]);
            msg_string = add_msg(key, key[0], key[1]);
            socket.emit('update_room', msg_string);
        };
    })
    socket.on( "add_new_msg", function(data){
        var msg_string = '';
        var msg_id = socket.id;
        var msg_name = session.users[msg_id];
        session['msg_num'] += 1;
        session.messages[msg_num] = [msg_name, data.message];
        console.log(msg_id, msg_name, data.message);
        msg_string = add_msg(session['msg_num'], msg_name, data.message);
        socket.emit('update_room', msg_string);
        socket.broadcast.emit('update_room', msg_string);
    });
    socket.on( "disconnect", function (){
        socket.broadcast.emit('left_room', socket.id);
    });
    //Builds message string
    function add_msg(id, name, msg){
        msg_string = "<dl class='row d-inline-block' id='" + id + "'><dt class='col-sm-4 d-inline'>" + name + ":</dt><dd class='col-md-12 d-inline'>" + msg + "</dd></dl>";
        return msg_string;
    }
})
  
