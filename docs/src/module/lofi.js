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
    }
  }

  type();
});
