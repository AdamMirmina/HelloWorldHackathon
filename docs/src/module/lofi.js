document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    const startText = document.getElementById('start-text');
    const message = "Click to start studying...";
    let index = 0;

    // Disable clicking until typing finishes
    overlay.style.pointerEvents = "none";

    function type() {
        if (index < message.length) {
            startText.textContent += message.charAt(index);
            index++;
            setTimeout(type, 100); // typing speed
        } else {
            // Enable clicking after typing completes
            overlay.style.pointerEvents = "auto";
        }
    }

    type(); // start typing

    // Click to remove overlay
    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
    });
});
