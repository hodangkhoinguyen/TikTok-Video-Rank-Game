'use strict'

const continueButton = document.getElementById("continue_button");
continueButton.addEventListener("click", continueFunction);
const videoButton = document.getElementById("videos_button");
videoButton.addEventListener("click", myVideo);

async function sendPostRequest(url, data) {
  console.log("about to send post request");
  let response = await fetch(url, {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data) });
  console.log(typeof(response));
  if (response.ok) {
    let data = await response.json();
    return data;
  } else {
    throw Error(response.status);
  }
}

function myVideo() {
  window.location = "/myVideos.html";  
}

function continueFunction() {
  const userid = document.getElementsByName("username")[0].value;
  const url = document.getElementsByName("url")[0].value;
  const nickname = document.getElementsByName("nickname")[0].value;

  let info = {
    "userid" : userid,
    "url" : url,
    "nickname" : nickname
    };
  
  sendPostRequest('/videoData', info)
// since this page appears at 
// https://POST-Example.profamenta.repl.co
// the POST request goes to 
// https://POST-Example.profamenta.repl.co/newlog
  .then(function (data) {
    console.log("got back the following string");
    console.log(data);
    if (data == "Database full") {
      alert(data);
    }
    else {
      window.location = "/videoData.html";
    }
  })
  .catch(function (error) {
     console.error('Error:', error);
  });
}

