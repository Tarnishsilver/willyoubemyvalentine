// Array of predefined heart images
const heartImages = [
    'heart1.png',
    'heart2.png',
    'heart3.png'
  ];
  
  // Function to create falling hearts
  const container = document.querySelector('.heart-container');

  // Hearts scale with the screen so they look right on a desktop and a phone
  function getRandomHeartSize() {
    const reference = Math.min(window.innerWidth, window.innerHeight);
    return reference * (0.08 + Math.random() * 0.14); // 8% to 22% of the short axis
  }

  function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
  
    // Randomly select a heart image
    const randomHeartImage = heartImages[Math.floor(Math.random() * heartImages.length)];
    heart.style.backgroundImage = `url(${randomHeartImage})`;
    
    const size = getRandomHeartSize();
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    
    // Centre-align the horizontal position so hearts don't hang off the edge
    const x = Math.random() * window.innerWidth - size / 2;
    heart.style.setProperty('--x', `${x}px`);
    
    const duration = Math.random() * 5 + 5; // Random duration between 5s and 10s
    heart.style.animationDuration = `${duration}s`;
    
    container.appendChild(heart);
    
    // Remove the heart after animation ends
    setTimeout(() => {
      heart.remove();
    }, duration * 1000);
  }

  // Phones are slower, so spawn fewer hearts to keep scrolling smooth
  const spawnInterval = window.innerWidth < 600 ? 420 : 200;
  
  // Start generating hearts as soon as the markup exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setInterval(createHeart, spawnInterval); // Generate hearts continuously
    });
  } else {
    setInterval(createHeart, spawnInterval);
  }