// index.js
// This is our main server file
'use strict'

// include express
const express = require("express");
// create object to interface with express
const app = express();
const bodyParser = require('body-parser');
const fetch = require("cross-fetch");
// get Promise-based interface to sqlite3
const db = require('./sqlWrap');
const win = require("./pickWinner");
// Code in this section sets up an express pipeline
app.use(express.static("public"));
// print info about incoming HTTP request 
// for debugging

// a module that gets json out of the request body; not needed yet, but very useful!
app.use(express.json());

// gets text out of the HTTP body and into req.body
app.use(bodyParser.text());

app.use(function(req, res, next) {
  console.log(req.method,req.url);
  next();
})

// make all the files in 'public' available 
app.use(express.static("public"));

// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/myVideos.html");
});

app.post('/videoData', function(req, res, next) {
  console.log("Server received a post request at", req.url);
  let videoObj = req.body;
  console.log("It contained this string:", videoObj);
  newVideo(videoObj)
  .then(function(result) {
    res.json(result);
  })
  .catch(function(err) {console.log("Cannot add a new video")});
});

app.post('/acknowledgement', function(req, res, next) {
  console.log("Server received a post request at", req.url);
  let text = req.body;
  console.log("It contained this string:",text);
  res.json("I got your POST request");
});

app.post('/deleteVideo', function(req, res, next) {
  console.log("Server received a post request at", req.url);
  let videoObj = req.body;
  deleteVideo(videoObj.nickname)
  .then(function(result) {
    res.json("Deleted successfully");
  })
  .catch(function(err) {console.log("Cannot get the video list")});
});

app.get('/getMostRecent', function(req, res, next) {
  console.log("Server received a post request at", req.url);
  getMostRecentVideo()
  .then(function(result) {
    if (result === undefined) {
      res.json("Database is empty");
    }
    else {
      res.json(result);
    }
  })
  .catch(function(err) {console.log("Cannot get the most recent video")});
});

app.get('/getList', function(req, res, next) {
  console.log("Server received a post request at", req.url);
  dumpTable()
  .then(function(result) {
    res.json(result);
  })
  .catch(function(err) {console.log("Cannot get the video list")});
});


app.get("/getTwoVideos", async function(req, res) {
  let videos = await win.getAllVideos();
  let len = videos.length;

  let num1 = getRandomInt(len);
  let num2;
  do {
    num2 = getRandomInt(len);
  } while (num1 == num2);
  let result = [videos[num1], videos[num2]];
  res.json(result);
});

app.get("/getWinner", async function(req, res) {
  console.log("getting winner");
  try {
  // change parameter to "true" to get it to computer real winner based on PrefTable 
  // with parameter="false", it uses fake preferences data and gets a random result.
  // winner should contain the rowId of the winning video.
  let rowId = await win.computeWinner(8, false);
  let winner = await getVideo(rowId);
    
  // you'll need to send back a more meaningful response here.
  res.json(winner);
  } catch(err) {
    res.status(500).send(err);
  }
});

app.post("/insertPref", async function(req, res) {
  let better = req.body.better;
  let worse = req.body.worse;
  await win.insertPreference(better, worse);
  let pref = await win.getAllPrefs();
  console.log(pref.length);
  if (pref.length >= 15) {
    res.send("pick winner");
  }
  else {
    res.send("continue");
  }
});

// Need to add response if page not found!
app.use(function(req, res){ res.status(404); res.type('txt'); res.send('404 - File '+req.url+' not found'); });



// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function () {
  console.log("The static server is listening on port " + listener.address().port);
});

//An async function to check if the database can store more videos
async function newVideo(v) {
  let result = await dumpTable();
  if (result.length < 8) {
    await insertVideo(v); 
    return "Added to database";
  }
  else {
    return "Database full";
  }
}

// An async function to insert a video into the database
async function insertVideo(v) {
  let sql = "update VideoTable set flag=FALSE where flag=TRUE";
  await db.run(sql);
  sql = "insert into VideoTable (url,nickname,userid,flag) values (?,?,?,TRUE)";
  
  await db.run(sql,[v.url, v.nickname, v.userid]);
}

// An async function to dump the database's content
async function dumpTable() {
  const sql = "select * from VideoTable";  
  let result = await db.all(sql);
  return result;
}

// An async function to get the most recent video
async function getMostRecentVideo() {
  const sql = "select * from VideoTable where flag=TRUE";
  let result = await db.get(sql);
  return result;
}

async function deleteVideo(v) {
  const sql = "delete from VideoTable where nickname=?";
  await db.run(sql, [v]);
}

async function getVideo(rowIdNum) {
  const sql = "select * from VideoTable where rowIdNum = ?";
  let result = await db.get(sql, [rowIdNum]);
  return result;
}

/* might be a useful function when picking random videos */
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}
