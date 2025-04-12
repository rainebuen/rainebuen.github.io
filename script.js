window.addEventListener('scroll', function () {
  // Your existing scroll logic for navbar
  const fromTop = window.scrollY + 200;
  const nav = document.querySelector('nav');
  const navLinks = document.querySelectorAll('nav .nav-links a');
  const contactSection = document.querySelector('#contactme');

  if (window.scrollY > 200) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Check if we've reached the contact section
  const contactOffset = contactSection.offsetTop;
  const windowBottom = window.scrollY + window.innerHeight;
  
  // If we're at the bottom of the page or in contact section
  if ((windowBottom >= document.body.offsetHeight - 100) || 
      (fromTop >= contactOffset - 100)) {
    navLinks.forEach(l => l.classList.remove('active'));
    // Find and activate the Contact Me button
    const contactBtn = document.querySelector('nav .nav-links button.contact');
    if (contactBtn) {
      contactBtn.classList.add('active');
    }
    return;
  }

  // Regular section highlighting
  navLinks.forEach(link => {
    if (link.classList.contains('contact')) return;
    
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });

  // Handle scroll animations
  handleScrollAnimations();
});

function scrollToContactMe() {
  const contactSection = document.querySelector('#contactme');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    const navLinks = document.querySelectorAll('nav .nav-links a, nav .nav-links button');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('nav .nav-links button.contact').classList.add('active');
  }
}

document.querySelectorAll('nav .nav-links a').forEach(link => {
  link.addEventListener('click', function (e) {
    if (this.classList.contains('contact')) return;
    
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
      
      const navLinks = document.querySelectorAll('nav .nav-links a, nav .nav-links button');
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    }
  });
});

// Scroll animation handler
function handleScrollAnimations() {
  const sections = document.querySelectorAll('.animate-section');
  const windowHeight = window.innerHeight;
  const triggerPoint = windowHeight * 0.8; // 80% from top

  sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    
    if (sectionTop < triggerPoint) {
      section.classList.add('animate-active');
    }
  });
}

// Initialize animations on load
document.addEventListener('DOMContentLoaded', () => {
  // Run once to check if elements are already in view
  handleScrollAnimations();
  
  // Add event listener for scroll
  window.addEventListener('scroll', handleScrollAnimations);
  
  // Initialize your ProjectSlider
  new ProjectSlider();
});

class ProjectSlider {
  constructor() {
    this.slider = document.querySelector('.project-wrapper');
    this.isDown = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.cardMargin = 20; // Adjust this based on your actual CSS margin
    this.debounceTimeout = null;

    this.init();
  }

  init() {
    if (!this.slider) return;

    this.slider.style.cursor = 'grab';

    this.slider.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.slider.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.slider.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.slider.addEventListener('mousemove', this.handleMouseMove.bind(this));

    this.slider.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.slider.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.slider.addEventListener('touchmove', this.handleTouchMove.bind(this));

    this.createScrollIndicator();
    this.slider.addEventListener('scroll', this.updateScrollIndicator.bind(this));

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.createScrollIndicator();
      }, 100);
    });
    resizeObserver.observe(this.slider);

    const mutationObserver = new MutationObserver(() => {
      this.createScrollIndicator();
    });
    mutationObserver.observe(this.slider, { childList: true });
  }

  handleMouseDown(e) {
    if (e.button !== 0) return; 
    this.isDown = true;
    this.slider.style.cursor = 'grabbing';
    this.slider.style.userSelect = 'none';
    this.startX = e.pageX - this.slider.offsetLeft;
    this.scrollLeft = this.slider.scrollLeft;
  }

  handleMouseLeave() {
    this.isDown = false;
    this.slider.style.cursor = 'grab';
    this.slider.style.removeProperty('user-select');
  }

  handleMouseUp() {
    this.isDown = false;
    this.slider.style.cursor = 'grab';
    this.slider.style.removeProperty('user-select');
  }

  handleMouseMove(e) {
    if (!this.isDown) return;
    e.preventDefault();
    const x = e.pageX - this.slider.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.slider.scrollLeft = this.scrollLeft - walk;
    this.updateScrollIndicator();
  }

  handleTouchStart(e) {
    this.isDown = true;
    this.startX = e.touches[0].pageX - this.slider.offsetLeft;
    this.scrollLeft = this.slider.scrollLeft;
  }

  handleTouchEnd() {
    this.isDown = false;
  }

  handleTouchMove(e) {
    if (!this.isDown) return;
    e.preventDefault();
    const x = e.touches[0].pageX - this.slider.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.slider.scrollLeft = this.scrollLeft - walk;
    this.updateScrollIndicator();
  }

  createScrollIndicator() {
    const cards = this.slider.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    const existingIndicator = document.querySelector('.scroll-indicator');
    if (existingIndicator) existingIndicator.remove();

    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';

    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth + this.cardMargin;
    const containerWidth = this.slider.clientWidth;
    const scrollWidth = this.slider.scrollWidth;
    
    const visibleCards = Math.floor(containerWidth / cardWidth);
    const totalCards = cards.length;
    const dotCount = Math.max(1, totalCards - visibleCards + 1);

    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'scroll-dot';
      dot.dataset.index = i;
      dot.addEventListener('click', () => {
        const scrollTo = i * cardWidth;
        this.slider.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      });
      indicator.appendChild(dot);
    }

    if (indicator.firstChild) {
      document.querySelector('.project-section').appendChild(indicator);
      this.updateScrollIndicator();
    }
  }

  updateScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    const dots = indicator.querySelectorAll('.scroll-dot');
    if (dots.length === 0) return;

    const cards = this.slider.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth + this.cardMargin;
    const scrollPosition = this.slider.scrollLeft;
    const activeIndex = Math.round(scrollPosition / cardWidth);

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === Math.min(activeIndex, dots.length - 1));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProjectSlider();
});


document.addEventListener('DOMContentLoaded', function() {
  // Check for success parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    showSuccessPopup();
    // Clean the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  // Close popup when X is clicked
  document.querySelector('.close-popup')?.addEventListener('click', hideSuccessPopup);
});

function showSuccessPopup() {
  const popup = document.getElementById('successPopup');
  if (popup) {
    popup.style.display = 'flex';
    // Auto-close after 5 seconds
    setTimeout(hideSuccessPopup, 5000);
  }
}

function hideSuccessPopup() {
  const popup = document.getElementById('successPopup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// Updated validateForm function
function validateForm() {
  const form = document.forms['contactForm'];
  const name = form['name'].value.trim();
  const email = form['email'].value.trim();
  const phone = form['phone'].value.trim();
  const subject = form['subject'].value.trim();
  const message = form['message'].value.trim();

  // Validate name (letters and spaces only)
  if (name === '' || !/^[a-zA-Z\s]+$/.test(name)) {
    alert('Name must be filled out and must only contain letters');
    return false;
  }

  // Validate at least one contact method
  if (email === '' && phone === '') {
    alert('Please provide either an email or phone number');
    return false;
  }

  // Validate email if provided
  if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address');
    return false;
  }

  // Validate phone if provided
  if (phone !== '' && !/^[\d\s\-()+]+$/.test(phone)) {
    alert('Please enter a valid phone number');
    return false;
  }

  // Validate subject and message
  if (subject === '') {
    alert('Please enter a subject');
    return false;
  }

  if (message === '') {
    alert('Please enter your message');
    return false;
  }

  return confirm('Do you want to send this message?');
}
