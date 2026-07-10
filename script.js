const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");
const backToTop = document.querySelector(".back-to-top");
const copyButton = document.querySelector(".copy-email");
const copyStatus = document.querySelector(".copy-status");
const ambientCanvas = document.querySelector("#ambientCanvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function closeMenu() {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") {
      event.preventDefault();
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navItems.forEach((item) => {
        item.classList.toggle("active", item.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

sections.forEach((section) => {
  navObserver.observe(section);
});

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 600);
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

copyButton.addEventListener("click", async () => {
  const email = copyButton.dataset.email;

  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = email === "Add your email here" ? "Add your real email in the HTML." : "Email copied to clipboard.";
  } catch (error) {
    copyStatus.textContent = email;
  }

  setTimeout(() => {
    copyStatus.textContent = "";
  }, 2600);
});

function startAmbientSignal() {
  if (!ambientCanvas || reduceMotion.matches) return;

  const context = ambientCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let pulseTimer = 0;
  let particles = [];
  let pulses = [];

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeParticle() {
    const isGold = Math.random() > 0.72;

    return {
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      radius: randomBetween(0.9, 2.4),
      speedX: randomBetween(-0.08, 0.18),
      speedY: randomBetween(-0.16, 0.04),
      glow: randomBetween(0.08, 0.24),
      color: isGold ? "240, 189, 93" : "40, 215, 196"
    };
  }

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    ambientCanvas.width = Math.floor(width * pixelRatio);
    ambientCanvas.height = Math.floor(height * pixelRatio);
    ambientCanvas.style.width = `${width}px`;
    ambientCanvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const particleCount = width < 700 ? 26 : 46;
    particles = Array.from({ length: particleCount }, makeParticle);
    pulses = [];
  }

  function drawParticle(particle) {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x > width + 20) particle.x = -20;
    if (particle.x < -20) particle.x = width + 20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    const gradient = context.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.radius * 8
    );

    gradient.addColorStop(0, `rgba(${particle.color}, ${particle.glow})`);
    gradient.addColorStop(1, `rgba(${particle.color}, 0)`);

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius * 8, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = `rgba(${particle.color}, ${particle.glow + 0.1})`;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }

  function drawPulse(pulse) {
    pulse.age += 1;
    const progress = pulse.age / pulse.life;
    const radius = pulse.radius + progress * 58;
    const alpha = Math.max(0, 0.16 * (1 - progress));

    context.strokeStyle = `rgba(${pulse.color}, ${alpha})`;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
    context.stroke();

    return progress < 1;
  }

  function addPulse() {
    const isGold = Math.random() > 0.55;
    pulses.push({
      x: randomBetween(width * 0.1, width * 0.9),
      y: randomBetween(height * 0.14, height * 0.86),
      radius: randomBetween(8, 22),
      age: 0,
      life: randomBetween(110, 170),
      color: isGold ? "240, 189, 93" : "40, 215, 196"
    });
  }

  function render() {
    context.clearRect(0, 0, width, height);

    const slowDrift = context.createLinearGradient(0, 0, width, height);
    slowDrift.addColorStop(0, "rgba(40, 215, 196, 0.018)");
    slowDrift.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    slowDrift.addColorStop(1, "rgba(240, 189, 93, 0.014)");
    context.fillStyle = slowDrift;
    context.fillRect(0, 0, width, height);

    particles.forEach(drawParticle);

    pulseTimer += 1;
    if (pulseTimer > 150) {
      addPulse();
      pulseTimer = 0;
    }

    pulses = pulses.filter(drawPulse);
    animationFrame = requestAnimationFrame(render);
  }

  resizeCanvas();
  render();
  window.addEventListener("resize", resizeCanvas);

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      cancelAnimationFrame(animationFrame);
      context.clearRect(0, 0, width, height);
    } else {
      resizeCanvas();
      render();
    }
  });
}

startAmbientSignal();
