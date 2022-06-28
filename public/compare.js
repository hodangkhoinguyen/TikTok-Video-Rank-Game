let videoElmts = document.getElementsByClassName("tiktokDiv");
let winner = 2, loser = 2;
let reloadButtons = document.getElementsByClassName("reload");
let heartButtons = document.querySelectorAll("div.heart");
let nickname = document.getElementsByClassName("nickname");
let nextButton = document.getElementsByClassName("enabledButton")[0];
nextButton.addEventListener("click", nextClick)
let videos;
for (let i=0; i<2; i++) {
  let reload = reloadButtons[i]; 
  reload.addEventListener("click",function() { reloadVideo(videoElmts[i]) });
  heartButtons[i].classList.add("unloved");
  heartButtons[i].addEventListener("click", function() {
    heartClick(i);
  });
} // for loop
// hard-code videos for now
// You will need to get pairs of videos from the server to play the game.
let urls = ["https://www.tiktok.com/@berdievgabinii/video/7040757252332047662",
"https://www.tiktok.com/@catcatbiubiubiu/video/6990180291545468166"];

sendGetRequest("/getTwoVideos")
.then(function(result) {
  videos = result;
  urls = [result[0].url, result[1].url];
  for (let i=0; i<2; i++) {
      addVideo(urls[i],videoElmts[i]);
    
      nickname[i].textContent = result[i].nickname;
  }
// load the videos after the names are pasted in! 
loadTheVideos();
})
.catch(function(err) {
    console.log("GET request error",err);
});

function heartClick(num) {  
  winner = num;
  loser = 1 - num;
  
  heartButtons[winner].classList.remove("unloved");
  let child = document.createElement("i");
  child.className = "fas fa-heart";
  heartButtons[winner].replaceChild(child, heartButtons[winner].childNodes[0]);

  heartButtons[loser].classList.add("unloved");
  let child2 = document.createElement("i");
  child2.className = "far fa-heart";
  heartButtons[loser].replaceChild(child2, heartButtons[loser].childNodes[0]);
}

function nextClick() {
  if (winner == 2) {
    alert("Please choose one video");
  }
  else {
    sendPostRequest("/insertPref", {"better": videos[winner].rowIdNum, "worse": videos[loser].rowIdNum})
    .then(function (result) {
      if (result == "continue") {
        window.location.reload();
        console.log(1);
      }
      else if (result == "pick winner") {
        window.location = "/winner.html";
        console.log(2);
      }
    })
    .catch(function(err) {
      console.log("POST request error",err);
    });
  }
  
}
    