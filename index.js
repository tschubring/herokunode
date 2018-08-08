
const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg')
const envUrl=process.env.DATABASE_URL;
const dbUrl ='postgres://fdhnjjxenmrtbl:66eb82d538a2f1f0e623657c571b7a6a7a175a234065a4a3fa94e26eb58e96c6@ec2-54-227-241-179.compute-1.amazonaws.com:5432/dfv16qht4jj8kv'
const pool = new Pool({
  connectionString: envUrl,
  ssl: true
})
      console.log("dbUrl "+ dbUrl);
      console.log("envUrl "+ envUrl);
//process.env.DATABASE_URL


express()
  .use(express.static(path.join(__dirname, 'public')))
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
  .get('/db', async (req, res) => {
  try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      res.render('pages/db', result);
      //res.send(result)
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })



  .listen(PORT, () => console.log(`Listening on ${ PORT }`))



