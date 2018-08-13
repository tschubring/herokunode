
const cool = require('cool-ascii-faces')
var express  = require('express');
var app=express();
function rnd(range){
  return Math.floor(range*Math.random());
}

const path = require('path')
const PORT = process.env.PORT || 5000

var server = app.listen(PORT, function () {
  console.log('index - server listening on port ' + PORT);
});
var io = require('socket.io')(server);

/*
var allClients = [];
io.sockets.on('connection', function(socket) {
   allClients.push(socket);

   socket.on('disconnect', function() {
      console.log('Got disconnect!');

      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
   });
});
*/
var allClients = [];

io.on('connection', function(socket){
  allClients.push(socket);
  console.log('index a user connected');
  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
    console.log('Got disconnect! ' +allClients.length);
  });

  socket.on('subscribeClient', function(data) {
    socket.join(data.room);
    console.log("index client subscribeClient="+data.room+" "+data.userId)
    io.to(data.room).emit('subscribeClientServer', data);
  })
  socket.on('clientState', function(data) {
    //console.log("index client clientState="+data.room+" "+data.userId);
    io.to(data.room).emit('clientState', data);  
  })
  socket.on('haveMap', function(data) {
    console.log("index haveMap");
    io.to(data.room).emit('haveMap', data);
  })

  socket.on('subscribeRoom', function(data) {
    console.log("index room subscribeRoom="+data.room+" userId "+data.userId)
    socket.join(data.room);
    io.to(data.room).emit('subscribeRoom', data);  
  })
  socket.on('roomState', function(data) {
    //console.log("index room roomState="+data.room)
    io.to(data.room).emit('roomState', data);  
  })

});


const { Pool } = require('pg')
const envUrl=process.env.DATABASE_URL
const dbUrl ='postgres://fdhnjjxenmrtbl:66eb82d538a2f1f0e623657c571b7a6a7a175a234065a4a3fa94e26eb58e96c6@ec2-54-227-241-179.compute-1.amazonaws.com:5432/dfv16qht4jj8kv'
const pool = new Pool({
  connectionString: dbUrl,
  ssl: true
})
      //console.log("dbUrl "+ dbUrl);
      //console.log("envUrl "+ envUrl);

app
  //.use(express.static(path.join(__dirname, 'public')))
  .use(express.static(__dirname + '/public'))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))

  .get('/times', (req, res) => {
    let result = ''
    const times = process.env.TIMES || 5
    for (i = 0; i < times; i++) {
      result += i + ' '
    }
    res.send(result)
  })

  .get('/dbr', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_room ORDER BY id ASC');
      res.render('pages/db', result);
      //res.send(result)
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/dbc', async (req, res) => {
    try {
      const text = 'INSERT INTO test_room(name) VALUES($1) RETURNING *';
      const values = ['brianc'+rnd(1000)];
      const client = await pool.connect();
      const result = await client.query(text, values);
      res.render('pages/db', result);
      //res.send(result)
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/dbu', async (req, res) => {
    try {
      const text = 'UPDATE test_room SET name = $1 WHERE id = 1  RETURNING *';
      const values = ['Randy '+rnd(1000)];
      const client = await pool.connect();
      const result = await client.query(text, values);
      res.render('pages/db', result);
      //res.send(result)
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/room', async (req, res) => {
    try {
      const text = 'INSERT INTO test_room(name) VALUES($1) RETURNING *';
      const values = ['brianc'+rnd(1000)];
      const client = await pool.connect();
      const result = await client.query(text, values);
      var myRoomId=result.rows[0].id;
      console.log("index room myRoomId="+myRoomId)

      res.render('pages/room', result);
      //res.send(result)
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/client', async (req, res) => {
    try {
      const username=cool();
      const text = 'INSERT INTO test_users(name, playlist) VALUES($1, $2) RETURNING *';
      const values = [username, '[]'];
      const client = await pool.connect();
      const result = await client.query(text, values);
      var myUserId=result.rows[0].id;
      console.log("index client myUserId="+myUserId)

      res.render('pages/client', result);
      //res.send(result)
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })



