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

function syncTopbarAuth() {
  if (!window.Phishy) return;
  const user = window.Phishy.auth.getCurrentUser();
  if (!user) return;

  const brand = document.querySelector("a.brand");
  const root = brand && brand.getAttribute("href") === "../" ? "../" : "";

  const handleSignOut = async () => {
    await window.Phishy.auth.signOut();
    window.location.href = root || "./";
  };

  document.querySelectorAll(".login-button").forEach((btn) => {
    btn.textContent = "Dashboard";
    btn.setAttribute("href", root + "dashboard/");

    const alreadyWrapped =
      btn.parentNode &&
      btn.parentNode.classList &&
      btn.parentNode.classList.contains("topbar-auth-group");

    if (btn.parentNode && !alreadyWrapped) {
      const wrap = document.createElement("div");
      wrap.className = "topbar-auth-group";
      btn.parentNode.insertBefore(wrap, btn);

      const signOut = document.createElement("button");
      signOut.type = "button";
      signOut.className = "topbar-signout";
      signOut.textContent = "Logout";
      signOut.addEventListener("click", handleSignOut);

      wrap.appendChild(signOut);
      wrap.appendChild(btn);
    }
  });

  document.querySelectorAll(".top-bar-menu-login").forEach((link) => {
    link.textContent = "Dashboard";
    link.setAttribute("href", root + "dashboard/");

    if (link.parentNode && !link.parentNode.querySelector(".top-bar-menu-signout")) {
      const signOut = document.createElement("button");
      signOut.type = "button";
      signOut.className = "top-bar-menu-signout";
      signOut.textContent = "Logout";
      signOut.addEventListener("click", handleSignOut);
      link.parentNode.appendChild(signOut);
    }
  });

  const desktopNav = document.querySelector(".top-nav");
  const mobileMenu = document.getElementById("top-bar-menu");

  if (user.role === "admin") {
    if (desktopNav && !desktopNav.querySelector('[data-nav="admin"]')) {
      const a = document.createElement("a");
      a.textContent = "Admin";
      a.setAttribute("href", root + "admin/");
      a.setAttribute("data-nav", "admin");
      desktopNav.appendChild(a);
    }
    if (mobileMenu && !mobileMenu.querySelector('[data-nav="admin"]')) {
      const a = document.createElement("a");
      a.textContent = "Admin";
      a.setAttribute("href", root + "admin/");
      a.setAttribute("data-nav", "admin");
      const loginLink = mobileMenu.querySelector(".top-bar-menu-login");
      mobileMenu.insertBefore(a, loginLink);
    }
  }
}

if (window.Phishy) {
  window.Phishy.ready().then(syncTopbarAuth);
} else {
  syncTopbarAuth();
}

const siteLoader = document.getElementById("site-loader");
if (siteLoader) {
  const hideLoader = () => {
    setTimeout(() => {
      siteLoader.classList.add("is-hidden");
      setTimeout(() => siteLoader.remove(), 400);
    }, 250);
  };

  const windowLoaded = new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve);
  });
  const phishyReady = window.Phishy ? window.Phishy.ready() : Promise.resolve();

  Promise.allSettled([windowLoaded, phishyReady]).then(hideLoader);
}
