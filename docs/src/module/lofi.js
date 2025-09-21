document.addEventListener('DOMContentLoaded', function() {
  const myButton = document.getElementById('intro');

  myButton.addEventListener('click', function() {
    myButton.classList.add('fade-out'); // Add the fade-out class

    // Optionally, remove the button from the DOM after the animation completes
    myButton.addEventListener('transitionend', function() {
      myButton.remove(); // Removes the button element
    }, { once: true }); // Ensures the event listener is removed after one use
  });
});