document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.getElementById("overlay-text");
  const textToType = "Welcome to my aesthetic webpage!";
  const typingSpeed = 100; // milliseconds per character

  let index = 0;

  function type() {
    if (index < textToType.length) {
      textElement.textContent += textToType.charAt(index);
      index++;
      setTimeout(type, typingSpeed);
    } else {
      // Typing finished, add transparent button
      showFullscreenButton();
    }
  }

  function showFullscreenButton() {
    const button = document.createElement("button");
    button.className = "fullscreen-button";

    // Insert button at the end of body (on top of everything)
    document.body.appendChild(button);

    // Only fade out the text when button is clicked
    button.addEventListener("click", () => {
      textElement.style.transition = "opacity 1s ease";
      textElement.style.opacity = "0";

      // Remove button after fade out
      setTimeout(() => {
        button.remove();
      }, 1000);
    });
  }

  // Start typing
  type();
});
