
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
const aglob="globular";
const { Pool } = require('pg')
const envUrl=process.env.DATABASE_URL
const dbUrl ='postgres://fdhnjjxenmrtbl:66eb82d538a2f1f0e623657c571b7a6a7a175a234065a4a3fa94e26eb58e96c6@ec2-54-227-241-179.compute-1.amazonaws.com:5432/dfv16qht4jj8kv'
const pool = new Pool({
  connectionString: dbUrl,
  ssl: true
})


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
  console.log('index a user connected '+aglob);
  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
    console.log('Got disconnect! ' +allClients.length);
  });

  socket.on('subscribeClient', async (data) => {
    socket.join(data.roomId);
    console.log("index client subscribeClient "+data.userId+" "+data.roomId);




    var nowMs=new Date().getTime(); 
    var text  = "DELETE FROM test_users WHERE updated < $1";
    var values = [nowMs-5000];
    try {
      const client = await pool.connect();
      const result = await client.query(text, values);
      console.log('DELETED '+result.rowCount);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }









    text  = "SELECT COUNT (*) FROM test_users WHERE roomId = $1";
    values = [data.roomId];

    try {
      const client = await pool.connect();
      const result = await client.query(text, values);
      client.release();


      var roomSeeds=JSON.stringify(generateSeeds(12));
      if(result.rowCount>0){// for safety only
        console.log('subscribed count '+result.rows[0]['count']);

        if(result.rows[0]['count']==1){
          const text  = "UPDATE test_room SET seeds = $1";
          const values = [roomSeeds];
          try {
            const client = await pool.connect();
            const result = await client.query(text, values);
            //console.log(result);
            client.release();   
          } catch (err) {
            console.error(err);
            res.send("Error " + err);
          }  
        }
        else{
          const text  = "SELECT seeds FROM test_room WHERE id = $1";
          const values = [data.roomId];
          try {
            const client = await pool.connect();
            const result = await client.query(text, values);
            console.log("select seeds "+result.rows[0].seeds);
            roomSeeds=result.rows[0].seeds;
            
            client.release();   
          } catch (err) {
            console.error(err);
            res.send("Error " + err);
          }  
        }
      }
      io.to(data.roomId).emit('haveSeeds', {seeds:roomSeeds});

    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  });

  socket.on('clientState', async (data) => {
    //console.log(data);
    const text  = "UPDATE test_users SET updated = $1 WHERE id = $2  RETURNING *";
    const values = [new Date().getTime(), data.userId];
    io.to(data.roomId).emit('clientState', data);

    try {

      //console.log('update test_users '+data.userId);
      const client = await pool.connect();
      const result = await client.query(text, values);
      //res.render('pages/db', result);
      //res.send(result)
      client.release();
      //console.log(result.rowCount);

    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
    ////io.to(data.room).emit('clientState', data);
  });
/*
  socket.on('haveMap', function(data) {
    console.log("index haveMap");
    io.to(data.roomId).emit('haveMap', data);
  })
*/
/*room is not working anymore. Just a lookyloo
  socket.on('subscribeRoom', function(data) {
    console.log("index room subscribeRoom="+data.roomId+" userId "+data.userId)
    socket.join(data.roomId);
    io.to(data.roomId).emit('subscribeRoom', data);  
    })
    socket.on('roomState', function(data) {
      //console.log("index room roomState="+data.roomId)
      io.to(data.roomId).emit('roomState', data);  
    })
*/

});// end of io.on


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
      const text = 'SELECT * FROM test_room WHERE id = 181';
      const values = [];
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
*/
  .get('/client', async (req, res) => {
    try {
      var nowMs=new Date().getTime(); 

      const username=cool();
      const text = 'INSERT INTO test_users(name,updated, roomId) VALUES($1, $2, $3) RETURNING *';
      const values = [username, nowMs, 181];
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

function generateSeeds(count){
  var seeds=[];
  for (var s=0; s<count; s++){
    seeds.push(rnd(1000)/1000);
  }
  return seeds;
}


