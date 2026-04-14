const topBar = document.querySelector(".top-bar");
const statsSection = document.querySelector(".info-band-section");
const statValues = document.querySelectorAll(".info-band-value[data-count]");
const menuToggle = document.querySelector(".menu-toggle");
const topBarMenu = document.getElementById("top-bar-menu");

if (menuToggle && topBarMenu) {
  const setOpen = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    topBarMenu.classList.toggle("is-open", isOpen);
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  topBarMenu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) setOpen(false);
  });
}

if (topBar) {
  const syncTopBarState = () => {
    topBar.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  syncTopBarState();
  window.addEventListener("scroll", syncTopBarState, { passive: true });
}

if (statsSection && statValues.length) {
  const formatValue = (value) => new Intl.NumberFormat("en-US").format(value);
  const animationFrameIds = new WeakMap();

  const animateValue = (element) => {
    const target = Number(element.dataset.count);
    const duration = 1800;
    const startTime = performance.now();
    const activeFrame = animationFrameIds.get(element);

    if (activeFrame) {
      cancelAnimationFrame(activeFrame);
    }

    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * eased);

      element.textContent = formatValue(currentValue);

      if (progress < 1) {
        const nextFrame = requestAnimationFrame(updateValue);
        animationFrameIds.set(element, nextFrame);
        return;
      }

      animationFrameIds.delete(element);
    };

    const frameId = requestAnimationFrame(updateValue);
    animationFrameIds.set(element, frameId);
  };

  const resetValue = (element) => {
    const activeFrame = animationFrameIds.get(element);

    if (activeFrame) {
      cancelAnimationFrame(activeFrame);
      animationFrameIds.delete(element);
    }

    element.textContent = "0";
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statValues.forEach((value) => animateValue(value));
          return;
        }

        statValues.forEach((value) => resetValue(value));
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(statsSection);
}
