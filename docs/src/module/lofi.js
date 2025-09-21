document.addEventListener("DOMContentLoaded", function () {
  const myButton = document.getElementById("intro");
  const backgroundMusic = document.getElementById("backgroundMusic");

  myButton.addEventListener("click", function () {
    backgroundMusic.play();
    console.log("play!");

    myButton.classList.add("fade-out"); // Add the fade-out class

    // Optionally, remove the button from the DOM after the animation completes
    myButton.addEventListener(
      "transitionend",
      function () {
        myButton.remove(); // Removes the button element
        console.log("play!");
      },
      { once: true }
    ); // Ensures the event listener is removed after one use
  });
});

var isPaused = false;
var elem = document.getElementById("muteBtn");
muteBtn.addEventListener("click", function () {
  if (isPaused == true) {
    backgroundMusic.play();
    console.log("play!");
    isPaused = false;
    elem.value = "Mute";
  } else {
    backgroundMusic.pause();
    isPaused = true;
    console.log("pause!");
    elem.value = "Unmute";
  }
});

function showPage(pageName) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(pageName + "Page");
  if (targetPage) {
    targetPage.classList.add("active");
  }
}
