const container = document.querySelector('.container');
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
const loadingContainer = document.getElementById('loading');

// Room kept between the "No" button and the edges of the card
const EDGE_MARGIN = 8;

// Gap between the two buttons when they sit side by side
const SIDE_GAP = 16;

// Express a viewport rect in coordinates relative to the card
function relativeToContainer(rect, containerRect) {
  return {
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    width: rect.width,
    height: rect.height
  };
}

// Does the proposed "No" button position overlap the "Yes" button?
function overlapsYes(x, y, noButtonRect, yesBox) {
  return (
    x < yesBox.left + yesBox.width &&
    x + noButtonRect.width > yesBox.left &&
    y < yesBox.top + yesBox.height &&
    y + noButtonRect.height > yesBox.top
  );
}

// Function to generate random position for "No" button within the container
function getRandomPosition(containerRect, noButtonRect, yesButtonRect) {
  // Clamp the range so the button can never be pushed off the card
  const maxX = Math.max(0, containerRect.width - noButtonRect.width - EDGE_MARGIN * 2);
  const maxY = Math.max(0, containerRect.height - noButtonRect.height - EDGE_MARGIN * 2);
  const yesBox = relativeToContainer(yesButtonRect, containerRect);

  let randomX = Math.min(EDGE_MARGIN, maxX);
  let randomY = Math.min(EDGE_MARGIN, maxY);

  // Generate random positions until they don't overlap with the "Yes" button.
  // The retry cap stops this spinning forever on a screen with no clear space.
  for (let attempt = 0; attempt < 25; attempt++) {
    randomX = EDGE_MARGIN + Math.random() * maxX;
    randomY = EDGE_MARGIN + Math.random() * maxY;

    if (!overlapsYes(randomX, randomY, noButtonRect, yesBox)) break;
  }

  return { x: randomX, y: randomY };
}

// Set initial position for the "Yes" and "No" buttons
function setInitialButtonPositions() {
  const containerRect = container.getBoundingClientRect();
  const yesButtonRect = yesButton.getBoundingClientRect();
  const noButtonRect = noButton.getBoundingClientRect();

  // The "No" button is out of flow, so its usable space is the whole card
  const maxX = containerRect.width - noButtonRect.width - EDGE_MARGIN;
  const maxY = containerRect.height - noButtonRect.height - EDGE_MARGIN;
  const yesX = yesButtonRect.left - containerRect.left;
  const yesY = yesButtonRect.top - containerRect.top;

  const besideX = yesX + yesButtonRect.width + SIDE_GAP;
  const belowY = yesY + yesButtonRect.height + SIDE_GAP;

  if (besideX <= maxX) {
    // Enough room: sit just beside the "Yes" button
    noButton.style.transform = `translate(${besideX}px, ${yesY}px)`;
  } else {
    // Narrow screen: stack the "No" button underneath instead
    const x = Math.max(0, Math.min(EDGE_MARGIN, maxX));
    const y = maxY >= EDGE_MARGIN
      ? Math.max(EDGE_MARGIN, Math.min(belowY, maxY))
      : Math.max(0, maxY);
    noButton.style.transform = `translate(${x}px, ${y}px)`;
  }
}

// Timestamp of the last dodge, used to swallow duplicate touch events
let lastDodge = 0;

// Run the "No" button away whenever the pointer reaches it
function dodgeNoButton() {
  // Phones fire both pointer and touch events for one tap, so only move once
  const now = Date.now();
  if (now - lastDodge < 250) return;
  lastDodge = now;

  // Get the dimensions of the container, "No" button, and "Yes" button
  // Generate a random position within the container but avoid the "Yes" button
  const position = getRandomPosition(
    container.getBoundingClientRect(),
    noButton.getBoundingClientRect(),
    yesButton.getBoundingClientRect()
  );

  // Update the button's position
  noButton.style.transform = `translate(${position.x}px, ${position.y}px)`;
}

// Mouse, finger tap and keyboard focus all need to trigger the dodge
noButton.addEventListener('mouseover', dodgeNoButton);
noButton.addEventListener('touchstart', dodgeNoButton, { passive: true });
noButton.addEventListener('focus', dodgeNoButton);
noButton.addEventListener('click', dodgeNoButton);

// Show custom loading GIF when "Yes" is clicked
yesButton.addEventListener('click', () => {
  // Show the loading GIF
  loadingContainer.classList.remove('hidden');

  // Redirect to the next page after 3 seconds
  setTimeout(() => {
    window.location.href = 'valentine.html';
  }, 3000); // 3 seconds delay
});

// Place the buttons as soon as the markup exists. Waiting for "load" would
// mean waiting on the large GIF before the buttons line up.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setInitialButtonPositions);
} else {
  setInitialButtonPositions();
}

// Re-place the buttons when a phone is rotated or the window resizes
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setInitialButtonPositions, 150);
});