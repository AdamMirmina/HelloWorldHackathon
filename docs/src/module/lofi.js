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


    
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  const targetPage = document.getElementById(pageName + 'Page');
  if (targetPage) {
    targetPage.classList.add('active');
    console.log(`Navigated to ${pageName} page`); //console log to check if the right page is being loaded
  }
}
