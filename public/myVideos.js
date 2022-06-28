'use strict'

const numLabels = 8;
let label = [];
let box = []
let list = [];
let deleteButton = [];
let addButton = document.getElementById("add");
addButton.addEventListener("click", addNew);
let playButton = document.getElementById("continue_button");
playButton.addEventListener("click", playGame);

for (let i = 0; i < numLabels; i++) {
  label[i] = document.getElementsByClassName("label")[i];
  box[i] = document.getElementsByClassName("vtitle")[i];
  let button = document.getElementsByClassName("delete")[i];
  button.addEventListener("click", function() {
    deleteVideo(i).catch(function (error) {
  console.error('Error:', error);
});
  });
  deleteButton[i] = button;
}

reloadTheList().catch(function (error) {
  console.error('Error:', error);
});

async function deleteVideo(i) {
  let content = label[i].textContent;
  if (content != "") {
    await sendPostRequest("/deleteVideo", {'nickname' : content});
    await reloadTheList();
  }
}

function addNew() {
  if (list.length == numLabels) {
    alert("There are enough videos");
  }
  else {
    window.location = "/tiktokpets.html";
  }
}

function playGame() {
  if (list.length < numLabels) {
    alert("There are NOT enough videos");
  }
  else {
    window.location = "/compare.html";
  }
}

async function reloadTheList() {
  list = await sendGetRequest("/getList");
  console.log(list);
  for (let i = 0; i < list.length; i++) {    
    box[i].style.borderStyle = "solid";
    box[i].style.backgroundColor = "#F8F8F8";
    label[i].textContent = list[i].nickname;
  }

  if (list.length == 8) {
    addButton.style.opacity = "0.5";
    addButton.disabled = true;

    playButton.style.opacity = "1";
    playButton.disabled = false;
  }
  else {
    for (let i = list.length; i < numLabels; i++) {    
      box[i].style.borderStyle = "dashed";
      box[i].style.backgroundColor = "white";
      label[i].textContent = "";
    }
    playButton.style.opacity = "0.5";
    playButton.disabled = true;

    addButton.style.opacity = "1";
    addButton.disabled = false;
  }
  
}

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