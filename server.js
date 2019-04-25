var app = require('./app');
var port = process.env.PORT || 4200;
// var config = require('./config');
// var express = require('express');
// var app = express();
var server = require('http').createServer(app);
// var chat = require('./admin/models/chat');
// app.use(chat);
// var http = require("http").Server(express)

// var io = require('socket.io')(server);
// var Chat = require('./admin/controllers/Chat');
// Chat.remove({}, function(err) {
//    console.log('chats removed')
// });
// app.get('/chats',function(req, res){
//    res.sendFile(config.directory + '/views/chat.html');
// });
// io.on('connection', function(client) {
//  client.on('save_message', function(data) {
//       var chat = new Chat()
//       chat.sender = data.name;
//       chat.receiver = 'bangarh';
//       chat.message = data.chat;
//       chat.type = 'model';
//       chat.save();
//       io.emit('save_message', data);
//       // io.emit(data, 'created');
//   });
// });
server.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
