(function () {
  const topbar = document.getElementById("topbar");
  const nav = document.getElementById("nav");
  const menuBtn = document.getElementById("menu-btn");
  const yearNode = document.getElementById("year");

  function setYear() {
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  function toggleTopbar() {
    if (!topbar) return;
    if (window.scrollY > 8) {
      topbar.classList.add("scrolled");
    } else {
      topbar.classList.remove("scrolled");
    }
  }

  function bindMobileNav() {
    if (!menuBtn || !nav) return;

    function syncNavAria() {
      const isMobileMenu = window.getComputedStyle(menuBtn).display !== "none";
      const isOpen = nav.classList.contains("open");
      nav.setAttribute("aria-hidden", String(isMobileMenu && !isOpen));
    }

    function closeNav() {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      syncNavAria();
    }

    menuBtn.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      syncNavAria();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeNav();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(event.target) || menuBtn.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener("resize", syncNavAria, { passive: true });
    syncNavAria();
  }

  function bindReveal() {
    const nodes = Array.from(document.querySelectorAll(".reveal"));
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (node) {
        node.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  setYear();
  toggleTopbar();
  bindMobileNav();
  bindReveal();
  window.addEventListener("scroll", toggleTopbar, { passive: true });
})();
