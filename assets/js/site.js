(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const topbar = document.querySelector("[data-site-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const drawer = document.querySelector("[data-drawer]");
  const body = document.body;

  function setYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function handleScrollHeader() {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 8);
  }

  function closeDrawer() {
    if (!drawer || !menuButton) return;
    drawer.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    body.classList.remove("nav-open");
  }

  function bindDrawer() {
    if (!drawer || !menuButton) return;

    menuButton.addEventListener("click", function () {
      const isOpen = drawer.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      body.classList.toggle("nav-open", isOpen);
    });

    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDrawer();
      }
    });

    document.addEventListener("click", function (event) {
      if (!drawer.classList.contains("open")) return;
      if (drawer.contains(event.target) || menuButton.contains(event.target)) return;
      closeDrawer();
    });
  }

  function bindNavDropdowns() {
    document.querySelectorAll(".nav-group").forEach(function (group) {
      const summary = group.querySelector(".nav-group-summary");
      if (!summary) return;

      function syncExpanded() {
        summary.setAttribute("aria-expanded", String(group.open));
      }

      group.addEventListener("toggle", syncExpanded);
      summary.addEventListener("click", function () {
        window.setTimeout(syncExpanded, 0);
      });
      syncExpanded();
    });
  }

  function bindFaq() {
    document.querySelectorAll("[data-faq-item]").forEach(function (item) {
      const button = item.querySelector("[data-faq-button]");
      if (!button) return;

      button.addEventListener("click", function () {
        const expanded = item.classList.toggle("open");
        button.setAttribute("aria-expanded", String(expanded));
      });
    });
  }

  function bindReveals() {
    const nodes = Array.from(document.querySelectorAll(".reveal"));
    if (!nodes.length) return;

    if (prefersReducedMotion) {
      nodes.forEach(function (node) {
        node.classList.add("visible");
      });
      return;
    }

    document.body.classList.add("js-motion");
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function bindCounters() {
    const counters = Array.from(document.querySelectorAll("[data-count]"));
    if (!counters.length) return;

    if (prefersReducedMotion) {
      counters.forEach(function (node) {
        node.textContent = node.getAttribute("data-count");
      });
      return;
    }

    const seen = new WeakSet();
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          const target = Number(entry.target.getAttribute("data-count"));
          const start = performance.now();
          const duration = 1300;

          function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);
            entry.target.textContent = String(current);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              entry.target.textContent = String(target);
            }
          }

          requestAnimationFrame(step);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function bindLightbox() {
    const lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox) return;

    const image = lightbox.querySelector("img");
    const closeButton = lightbox.querySelector("[data-lightbox-close]");
    const dialog = lightbox.querySelector(".gallery-lightbox-inner");
    let lastTrigger = null;

    function focusableElements() {
      return Array.from(lightbox.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
        .filter(function (node) {
          return !node.hasAttribute("disabled") && node.getAttribute("aria-hidden") !== "true";
        });
    }

    function close() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      body.style.overflow = "";
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    }

    document.querySelectorAll("[data-lightbox-src]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (!image) return;
        lastTrigger = button;
        image.src = button.getAttribute("data-lightbox-src");
        image.alt = button.getAttribute("data-lightbox-alt") || "";
        if (dialog) {
          dialog.setAttribute("aria-label", button.getAttribute("data-lightbox-label") || "Image preview");
        }
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
        if (closeButton) {
          closeButton.focus();
        }
      });
    });

    if (closeButton) {
      closeButton.addEventListener("click", close);
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("open")) return;
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key === "Tab") {
        const nodes = focusableElements();
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  async function submitForm(form) {
    const submitButton = form.querySelector("[type='submit']");
    const kind = form.getAttribute("data-form-kind") || "form";
    if (!submitButton) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      submitButton.disabled = true;
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.access_key = form.getAttribute("data-access-key");
      payload.subject = kind === "consultation"
        ? "New consultation request from sanjo.in"
        : "New contact enquiry from sanjo.in";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        window.alert(
          kind === "consultation"
            ? "Your consultation request has been sent. Sanjo's team will respond soon."
            : "Your message has been sent. Sanjo's team will get back to you soon."
        );
        form.reset();
      } catch (error) {
        console.error(error);
        window.alert("Unable to submit right now. Please use email or WhatsApp while this is retried.");
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  function bindForms() {
    document.querySelectorAll("[data-web3-form]").forEach(function (form) {
      submitForm(form);
    });
  }

  function bindBlogFilters() {
    const hub = document.querySelector("[data-blog-hub]");
    if (!hub) return;

    const search = hub.querySelector("[data-blog-search]");
    const cards = Array.from(hub.querySelectorAll("[data-blog-card]"));
    const resultCards = Array.from(hub.querySelectorAll("[data-blog-result]"));
    const buttons = Array.from(hub.querySelectorAll("[data-blog-category]"));
    const tagButtons = Array.from(hub.querySelectorAll("[data-blog-tag]"));
    const clearButtons = Array.from(hub.querySelectorAll("[data-blog-clear]"));
    const searchClearButton = hub.querySelector("[data-blog-search-clear]");
    const tagToggleButton = hub.querySelector("[data-blog-tag-toggle]");
    const extraTags = hub.querySelector("[data-blog-extra-tags]");
    const count = hub.querySelector("[data-blog-count]");
    const total = hub.querySelector("[data-blog-total]");
    const empty = hub.querySelector("[data-blog-empty]");
    const params = new URLSearchParams(window.location.search);
    let activeCategory = "All";
    let activeTag = "";

    if (params.get("category")) activeCategory = params.get("category");
    if (params.get("tag")) activeTag = params.get("tag");
    if (search && params.get("search")) search.value = params.get("search");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function setUrl(query) {
      const next = new URL(window.location.href);
      ["category", "tag", "search"].forEach(function (key) {
        next.searchParams.delete(key);
      });
      if (activeCategory && activeCategory !== "All") next.searchParams.set("category", activeCategory);
      if (activeTag) next.searchParams.set("tag", activeTag);
      if (query) next.searchParams.set("search", query);
      window.history.replaceState({}, "", next);
    }

    function syncActiveButtons() {
      buttons.forEach(function (button) {
        button.classList.toggle("active", button.getAttribute("data-blog-category") === activeCategory);
      });
      tagButtons.forEach(function (button) {
        button.classList.toggle("active", normalize(button.getAttribute("data-blog-tag")) === normalize(activeTag));
      });
    }

    function applyFilters() {
      const query = search ? search.value.trim().toLowerCase() : "";
      let visibleResults = 0;
      cards.forEach(function (card) {
        const categoryMatches = activeCategory === "All" || card.getAttribute("data-category") === activeCategory;
        const tagList = normalize(card.getAttribute("data-tags"));
        const tagMatches = !activeTag || tagList.split("|").includes(normalize(activeTag));
        const searchMatches = !query || (card.getAttribute("data-search") || "").includes(query);
        const show = categoryMatches && tagMatches && searchMatches;
        card.hidden = !show;
        if (show && card.hasAttribute("data-blog-result")) visibleResults += 1;
      });
      if (count) count.textContent = String(visibleResults);
      if (total) total.textContent = String(resultCards.length);
      if (empty) empty.hidden = visibleResults !== 0;
      clearButtons.forEach(function (button) {
        button.hidden = activeCategory === "All" && !activeTag && !query;
      });
      if (searchClearButton) searchClearButton.hidden = !query;
      syncActiveButtons();
      setUrl(query);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-blog-category") || "All";
        applyFilters();
      });
    });

    tagButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const tag = button.getAttribute("data-blog-tag") || "";
        activeTag = normalize(activeTag) === normalize(tag) ? "" : tag;
        applyFilters();
      });
    });

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    if (searchClearButton) {
      searchClearButton.addEventListener("click", function () {
        if (search) search.value = "";
        applyFilters();
        if (search) search.focus();
      });
    }

    clearButtons.forEach(function (clearButton) {
      clearButton.addEventListener("click", function () {
        activeCategory = "All";
        activeTag = "";
        if (search) search.value = "";
        applyFilters();
      });
    });

    if (tagToggleButton && extraTags) {
      tagToggleButton.addEventListener("click", function () {
        extraTags.toggleAttribute("hidden");
        const isHidden = extraTags.hasAttribute("hidden");
        tagToggleButton.textContent = isHidden ? "Show more tags" : "Show fewer tags";
        tagToggleButton.setAttribute("aria-expanded", String(!isHidden));
      });
    }

    applyFilters();
  }

  function bindImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        const fallback = document.createElement("div");
        fallback.className = image.className ? image.className + " fallback-thumb" : "fallback-thumb";
        fallback.setAttribute("role", "img");
        fallback.setAttribute("aria-label", image.alt || "Insight thumbnail");
        const label = document.createElement("span");
        label.textContent = image.getAttribute("data-fallback-label") || "Insight";
        fallback.appendChild(label);
        image.replaceWith(fallback);
      }, { once: true });
    });
  }

  function bindCopyLinks() {
    document.querySelectorAll("[data-copy-link]").forEach(function (button) {
      button.addEventListener("click", async function () {
        const value = button.getAttribute("data-copy-link");
        try {
          await navigator.clipboard.writeText(value);
          button.textContent = "Copied";
          window.setTimeout(function () {
            button.textContent = "Copy link";
          }, 1400);
        } catch (error) {
          window.prompt("Copy this link", value);
        }
      });
    });
  }

  function bindBooksCarousel() {
    document.querySelectorAll("[data-books-carousel]").forEach(function (carousel) {
      const slides = Array.from(carousel.querySelectorAll("[data-book-slide]"));
      const selectors = Array.from(carousel.querySelectorAll("[data-book-select]"));
      const previous = carousel.querySelector("[data-book-prev]");
      const next = carousel.querySelector("[data-book-next]");
      const current = carousel.querySelector("[data-book-current]");
      const total = carousel.querySelector("[data-book-total]");
      if (!slides.length) return;

      let activeIndex = 0;
      let timer = 0;
      let pointerInside = false;
      let focusInside = false;
      let touchStartX = 0;
      let touchStartY = 0;

      function render(manual) {
        slides.forEach(function (slide, index) {
          const active = index === activeIndex;
          slide.classList.toggle("active", active);
          slide.setAttribute("aria-hidden", String(!active));
          slide.querySelectorAll("a, button").forEach(function (node) {
            if (active) {
              node.removeAttribute("tabindex");
            } else {
              node.setAttribute("tabindex", "-1");
            }
          });
        });

        selectors.forEach(function (button, index) {
          const active = index === activeIndex;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
          button.setAttribute("tabindex", active ? "0" : "-1");
        });

        if (current) current.textContent = String(activeIndex + 1).padStart(2, "0");
        if (total) total.textContent = String(slides.length).padStart(2, "0");
        if (manual) restart();
      }

      function goTo(index, manual) {
        activeIndex = (index + slides.length) % slides.length;
        render(Boolean(manual));
      }

      function stop() {
        if (!timer) return;
        window.clearInterval(timer);
        timer = 0;
      }

      function start() {
        stop();
        if (prefersReducedMotion || pointerInside || focusInside || slides.length < 2) return;
        timer = window.setInterval(function () {
          goTo(activeIndex + 1, false);
        }, 7000);
      }

      function restart() {
        stop();
        window.setTimeout(start, 350);
      }

      if (previous) previous.addEventListener("click", function () { goTo(activeIndex - 1, true); });
      if (next) next.addEventListener("click", function () { goTo(activeIndex + 1, true); });

      selectors.forEach(function (button, index) {
        button.addEventListener("click", function () { goTo(index, true); });
        button.addEventListener("keydown", function (event) {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            selectors[(index + 1) % selectors.length].focus();
            goTo(index + 1, true);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            selectors[(index - 1 + selectors.length) % selectors.length].focus();
            goTo(index - 1, true);
          }
          if (event.key === "Home") {
            event.preventDefault();
            selectors[0].focus();
            goTo(0, true);
          }
          if (event.key === "End") {
            event.preventDefault();
            selectors[selectors.length - 1].focus();
            goTo(selectors.length - 1, true);
          }
        });
      });

      carousel.addEventListener("keydown", function (event) {
        if (event.target && event.target.hasAttribute && event.target.hasAttribute("data-book-select")) return;
        if (event.key === "ArrowRight") {
          goTo(activeIndex + 1, true);
        }
        if (event.key === "ArrowLeft") {
          goTo(activeIndex - 1, true);
        }
      });

      carousel.addEventListener("pointerenter", function () {
        pointerInside = true;
        stop();
      });
      carousel.addEventListener("pointerleave", function () {
        pointerInside = false;
        start();
      });
      carousel.addEventListener("focusin", function () {
        focusInside = true;
        stop();
      });
      carousel.addEventListener("focusout", function () {
        window.setTimeout(function () {
          focusInside = carousel.contains(document.activeElement);
          if (!focusInside) start();
        }, 0);
      });
      carousel.addEventListener("touchstart", function (event) {
        if (!event.touches || !event.touches.length) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }, { passive: true });
      carousel.addEventListener("touchend", function (event) {
        if (!event.changedTouches || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        const dy = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        goTo(dx < 0 ? activeIndex + 1 : activeIndex - 1, true);
      }, { passive: true });

      render(false);
      start();
    });
  }

  setYear();
  handleScrollHeader();
  bindDrawer();
  bindNavDropdowns();
  bindFaq();
  bindReveals();
  bindCounters();
  bindLightbox();
  bindForms();
  bindBlogFilters();
  bindCopyLinks();
  bindBooksCarousel();
  bindImageFallbacks();
  window.addEventListener("scroll", handleScrollHeader, { passive: true });
})();
