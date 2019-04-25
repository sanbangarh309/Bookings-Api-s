var app = require('../../app');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Chat = require('../controllers/Chat');
// Chat.remove({}, function(err) {
//    console.log('chats removed')
// });
// app.get('/chats',function(req, res){
//    res.sendFile(config.directory + '/views/chat.html');
// });
io.on('connection', function(client) {
    console.log('Client connected...');
 client.on('save_message', function(data) {
      console.log(data);
      var chat = new Chat()
      chat.sender = data.name;
      chat.receiver = 'bangarh';
      chat.message = data.chat;
      chat.type = 'model';
      chat.save();
        // io.emit(data, 'created');
  });
});
module.exports = io;
