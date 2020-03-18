require('dotenv').config()
const express = require('express')
const path = require('path');
const morgan = require('morgan'); // server logging
const passport = require('passport');  // authentication plug-in for express
const LocalStrategy = require('passport-local').Strategy
const server = express()
const port = process.env.PORT
var pgp = require('pg-promise')(/* options */)
var dbCxn = pgp(process.env.DATABASE_URL);
var bodyParser = require('body-parser')

server.use(bodyParser.json())
server.use(morgan('dev'))
server.disable('etag')  // prevents 304 logs

server.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
server.use(passport.initialize())
server.use(passport.session())
passport.use(new LocalStrategy(async function(username, password, done) {
  console.log("passportLocal", {username, password})
  const user = await dbCxn.one("SELECT * FROM Users WHERE username = $1", [username]).catch(err => done(err))
  if (!user) {
    console.log("user not found")
    return done(null, false, {message: "Incorrect username."})
  } else if (user.password !== password) {
    console.log("user found but wrong password")
    return done(null, false, {message: "Incorrect password."})
  } else {
    console.log("user authenticated")
    return done(null, user)
  }
}))
passport.serializeUser(function(user, done) {
  console.log("serializeUser user:", user)
  return done(null, user.id)
})
passport.deserializeUser(async function(id, done) {
  console.log("deserializeUser id:", id)
  const user = await dbCxn.one("SELECT * FROM Users WHERE id = $1", [id]).catch(error => done(error))
  console.log("deserializeUser user:", user)
  return done(null, user)
})
const AUTH_REQUIRED = (req, res, next) => req.isAuthenticated() ? next() : res.sendStatus(401)

server.get('/', (req, res) => res.sendFile(path.join(__dirname,'app.html')))

//user can read tweets
server.get('/tweets', async function readTweetsHandler(req, res){
  console.log('read tweets');
  const tweets = await dbCxn.any(`
    SELECT
      t.id, u.username, t.message
    FROM
      Tweets AS t
    JOIN
      Users AS u ON u.id = t.author_id
  `);
  res.status(200).json(tweets);
});

//these are all the same way to replace something as seen in the sql code
  // `where author_id = ${userId}`
  // 'where author_id = ${userId}'.replace('${userId}',userId)
  // 'where author_id = $1'.replace('$1',userId)

//user can create tweets
server.post('/tweets', AUTH_REQUIRED, async function createTweetHandler(req, res){
  const userId = req.user.id;
  const message = req.body.message;
  console.log('create tweet', {userId, message})
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
server.delete('/tweets/:tweetId', AUTH_REQUIRED, async function deleteTweetHandler(req, res){
  const tweetId = req.params.tweetId;
  const userId = req.user.id;
  console.log('delete tweet', {tweetId})
  if((await dbCxn.any(`
    SELECT
      *
    FROM
      Tweets
    WHERE
      id = $1
  `, [tweetId])).length === 0){
    res.sendStatus(404)
    return;
  }else if (!user.is_admin && (await dbCxn.any(`
      SELECT
        *
      FROM
        Tweets
      WHERE
        author_id = $1
        AND id = $2
    `, [userId, tweetId])).length === 0){
    res.sendStatus(401)
    return;
  }
  await dbCxn.any(`
    DELETE FROM
      Tweets
    WHERE
      id = $1
  `, [tweetId]);
  res.sendStatus(204)
})
server.post('/users', registerUser)


server.get('/users', passport.authenticate('local'), loginUser)
server.delete('/users', AUTH_REQUIRED, logoutUser)
server.listen(port, () => console.log(`Example app listening on port ${port}!`))

async function registerUser (req, res) {
  // const {username, password} = req.user // (same as the next two lines combined)
  const username = req.body.username
  const password = req.body.password
  const email = req.body.email
  const isAdmin = false
  console.log('registering user', {username, password, email, isAdmin})

  if (!username || !password || !email){
    return res.sendStatus(400)
  }
  if ((await dbCxn.any(`
    SELECT
      *
    FROM
      Users
    WHERE
      username = $1
      OR
      email = $2
  `, [username, email])).length > 0){
    res.sendStatus(409)
    return;
  }
  await dbCxn.any(`
    INSERT INTO
      Users
      (email, password, username, is_admin)
    VALUES
      ($1, $2, $3, $4)
  `, [email, password, username, isAdmin]); // username: 'mluby',True); --
  //  (${email}, ${password}, ${username}, ${isAdmin})
  res.sendStatus(201)
}

async function loginUser (req, res) {
  // const {username, password} = req.user // (same as the next two lines combined)
  const username = req.user.username
  const password = req.user.password

  console.log("loginUser", {username, password})
  if (!username || !password) return res.sendStatus(400)
  req.login(req.user, (err) => {
    if (err) {
      console.error("Session save went badly."+err)
      return res.status(500)
    }
    return res.sendStatus(200)
  })
}

async function logoutUser (req, res) {
  req.logout()
  res.sendStatus(204)
}
