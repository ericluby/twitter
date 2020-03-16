require('dotenv').config()
const express = require('express')
const path = require('path');
const server = express()
const port = process.env.PORT
var pgp = require('pg-promise')(/* options */)
var dbCxn = pgp(process.env.DATABASE_URL);
var bodyParser = require('body-parser')

server.use(bodyParser.json())

server.get('/', (req, res) => res.sendFile(path.join(__dirname,'app.html')))

//user can read tweets
server.get('/users/:userId/tweets', async function requestHandler(req, res){
  const userId = req.params.userId;
  const tweetsByUser = await dbCxn.any(`
    SELECT
      t.id, u.username, t.message
    FROM
      Tweets AS t
    JOIN
      Users AS u ON u.id = t.author_id
    WHERE
      author_id = $1
  `, [userId]);
  res.status(200).json(tweetsByUser);
});

//these are all the same way to replace something as seen in the sql code
  // `where author_id = ${userId}`
  // 'where author_id = ${userId}'.replace('${userId}',userId)
  // 'where author_id = $1'.replace('$1',userId)

//user can write tweets
server.post('/users/:userId/tweets', async function requestHandler(req, res){
  const userId = req.params.userId;
  const message = req.body.message;
  await dbCxn.any(`
    INSERT INTO
      Tweets
      (author_id, message)
    VALUES
      ($1, $2)
  `, [userId, message]);
   res.sendStatus(201)
})

//user can delete tweets
server.delete('/users/:userId/tweets/:tweetId', async function requestHandler(req, res){
  const tweetId = req.params.tweetId;
  await dbCxn.any(`
    DELETE FROM
      Tweets
    WHERE
      id = $1
  `, [tweetId]);
  res.sendStatus(204)
})

server.listen(port, () => console.log(`Example app listening on port ${port}!`))
