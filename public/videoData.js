// for example, these are hardcoded
var url = 'https://www.tiktok.com/@cheyennebaker1/video/7088856562982423854';

let divElmt = document.getElementById("tiktokDiv");
let nickname = document.getElementById("nickname");

// grab elements we'll use 
// these are global! 
let continueButton = document.getElementById("continue");
let reloadButton = document.getElementById("reload");

continueButton.addEventListener("click", continueFunction);
reloadButton.addEventListener("click", reloadVideo);

sendGetRequest('/getMostRecent')
.then(function (data) {
  if (data == "Database is empty")
  {
    alert("There is no video.")
  }
  else {
    url = data.url;
    nickname.textContent = data.nickname;
    // add the blockquote element that TikTok wants to load the video into
    addVideo(url,divElmt);
  
    // on start-up, load the videos
    loadTheVideos();
  }
})
.catch(function (error) {
   console.error('Error:', error);
});
  

// Add the blockquote element that tiktok will load the video into
async function addVideo(tiktokurl,divElmt) {

  let videoNumber = tiktokurl.split("video/")[1];

  let block = document.createElement('blockquote');
  block.className = "tiktok-embed";
  block.cite = tiktokurl;
  // have to be formal for attribute with dashes
  block.setAttribute("data-video-id",videoNumber);
  block.style = "width: 325px; height: 563px; margin: 0;" //changing margin to fit design
  let section = document.createElement('section');
  block.appendChild(section);
  
  divElmt.appendChild(block);
}

// Ye olde JSONP trick; to run the script, attach it to the body
function loadTheVideos() {
  body = document.body;
  script = newTikTokScript();
  body.appendChild(script);
}

// makes a script node which loads the TikTok embed script
function newTikTokScript() {
  let script = document.createElement("script");
  script.src = "https://www.tiktok.com/embed.js"
  script.id = "tiktokScript"
  return script;
}

// the reload button; takes out the blockquote and the scripts, and puts it all back in again.
// the browser thinks it's a new video and reloads it
function reloadVideo () {
  
  // get the two blockquotes
  let blockquotes 
 = document.getElementsByClassName("tiktok-embed");

  // and remove the indicated one
    block = blockquotes[0];
    console.log("block",block);
    let parent = block.parentNode;
    parent.removeChild(block);

  // remove both the script we put in and the
  // one tiktok adds in
  let script1 = document.getElementById("tiktokScript");
  let script2 = script.nextElementSibling;

  let body = document.body; 
  body.removeChild(script1);
  body.removeChild(script2);

  addVideo(url,divElmt);
  loadTheVideos();
}

function continueFunction() {
  let info = "acknowledgement done!";
  
  sendPostRequest('/acknowledgement')
  .then(function (data) {
    console.log("got back the following string");
    console.log(data); 
    window.location = "/myVideos.html";
  })
  .catch(function (error) {
     console.error('Error:', error);
  });
}

async function sendGetRequest(url) {
  console.log("about to send GET request");
    let response = await fetch(url, {
      method: 'GET', 
      headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
      let data = await response.json();
      return data;
    } else {
      throw Error(response.status);
    }
}

async function sendPostRequest(url, data) {
    console.log("about to send post request");
    let response = await fetch(url, {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data) });
    if (response.ok) {
      let data = await response.json();
      return data;
    } else {
      throw Error(response.status);
    }
  }
