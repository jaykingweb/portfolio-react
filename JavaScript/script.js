// Utility to initialize a sliding track
function initSlider(selector, animName, cloneCount = 1) {
  const track = document.querySelector(selector);
  if (!track) return;
  const cards = Array.from(track.children);

  // Clone each card 'cloneCount' times to ensure a smooth loop
  for (let i = 0; i < cloneCount; i++) {
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  }

  // Reset animation to avoid jumps
  function resetAnimation() {
    track.style.animation = "none";
    // Force reflow
    void track.offsetWidth;
    track.style.animation = `${animName}`;
  }

  track.addEventListener("animationend", resetAnimation);

  // Pause on hover for cards inside this track
  track.querySelectorAll(".review-box, .review-box-two").forEach((card) => {
    // Prevent wheel event from being blocked
    card.addEventListener("wheel", (e) => {
      e.stopPropagation();
    });

    card.addEventListener("mouseenter", (e) => {
      // Only pause if not scrolling
      if (!e.target.closest(".review-message, .review-message-two")) {
        track.classList.add("paused");
      }
    });

    card.addEventListener("mouseleave", () => track.classList.remove("paused"));
  });
}

// Initialize both sliders
initSlider(".slides-reviews", "scroll 30s linear infinite", 1);
initSlider(".slides-reviews-two", "scroll-two 36s linear infinite", 1);

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Mobile navbar toggle (hamburger)
(function () {
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.querySelector("header.myheads nav");
  if (!navToggle || !nav) return;
  const icon = navToggle.querySelector("i");

  // Toggle open/close
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const opened = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", opened);
    if (icon) {
      icon.classList.toggle("fa-bars", !opened);
      icon.classList.toggle("fa-xmark", opened);
    }
  });

  // Close when any nav link is clicked (mobile) and perform navigation like desktop
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      // Close menu if open on mobile
      if (window.innerWidth <= 992 && nav.classList.contains("open")) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", false);
        if (icon) {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      }

      // If it's an in-page anchor (e.g. "#section") scroll to it accounting for fixed header
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const id = href.slice(1);
        // small delay so the menu close animation can run
        setTimeout(() => {
          if (!id) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          const target = document.getElementById(id);
          if (target) {
            const header = document.querySelector("header");
            const offset = header ? header.offsetHeight + 8 : 78;
            const top =
              target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: "smooth" });
          } else {
            // fallback to top
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 180);
        return;
      }

      // For normal links (pages or absolute/relative URLs) allow navigation but wait briefly so the menu can close smoothly
      if (href && href !== "#" && !href.startsWith("javascript:")) {
        // If link opens in new tab, let default behavior happen
        if (link.target && link.target !== "_self") return;
        e.preventDefault();
        setTimeout(() => {
          window.location.href = href;
        }, 120);
      }
    });
  });

  // Close when clicking outside
  document.addEventListener("click", (ev) => {
    if (
      !nav.contains(ev.target) &&
      !navToggle.contains(ev.target) &&
      nav.classList.contains("open")
    ) {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", false);
      if (icon) {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    }
  });

  // Ensure nav is closed when resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992 && nav.classList.contains("open")) {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", false);
      if (icon) {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    }
  });
})();
