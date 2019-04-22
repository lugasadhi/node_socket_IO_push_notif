var express = require('express');
var app = express();
var cors = require('cors');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

var sql = require("mssql");
var dbConfig = {
  server:"172.16.1.24",
  database:"row",
  user:"sa",
  password:"sbtc2015",
  options: {
     encrypt: true // Use this if you're on Windows Azure
 }
};



users = [];
connections = [];


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


app.post('/api/getNotif', function (req, res) {
  (async function () {
      try {
          let pool = await sql.connect(dbConfig)
          let result = await pool.request()
              .input('token', sql.VarChar(100), req.body.token)
              .execute('sp_get_notif')
          sql.close();
          res.send(result.recordset);
      } catch (err) {
          res.send(err);
      }
  })()
  sql.on('error', err => {
    res.send(err);
  })
});




io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log('connected : %s socket connected');

  //Disconnected
  socket.on('disconnect',function(data){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s socket connected', connections.length);
  });


  //send msg
  socket.on('send message', function(data){
    console.log(data);
    io.sockets.emit('new message',{msg:data});
  });

  socket.on('send Notif', function(data){
    io.sockets.emit('new Notif',data);
  });

});


server.listen(port, ()=>{
  console.log(`server running in port ${port}.....` );
});
