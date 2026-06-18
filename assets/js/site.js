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
    const dataNode = hub.querySelector("[data-blog-posts]");
    const grid = hub.querySelector("[data-blog-grid]");
    const clearButtons = Array.from(hub.querySelectorAll("[data-blog-clear]"));
    const searchClearButton = hub.querySelector("[data-blog-search-clear]");
    const tagToggleButton = hub.querySelector("[data-blog-tag-toggle]");
    const extraTags = hub.querySelector("[data-blog-extra-tags]");
    const count = hub.querySelector("[data-blog-count]");
    const total = hub.querySelector("[data-blog-total]");
    const empty = hub.querySelector("[data-blog-empty]");
    const posts = dataNode ? JSON.parse(dataNode.textContent || "[]") : [];
    const params = new URLSearchParams(window.location.search);
    let activeCategory = "All";
    let activeTag = "";

    if (params.get("category")) activeCategory = params.get("category");
    if (params.get("tag")) activeTag = params.get("tag");
    if (search && params.get("search")) search.value = params.get("search");

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
      return escapeHtml(value);
    }

    function fallbackLabel(title) {
      return String(title || "Insight")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(function (part) { return part.charAt(0); })
        .join("")
        .toUpperCase() || "IN";
    }

    function renderPostImage(post) {
      if (!post.image) {
        return '<div class="blog-card-media fallback-thumb" role="img" aria-label="' + escapeAttr(post.imageAlt) + '"><span>' + escapeHtml(fallbackLabel(post.title)) + "</span></div>";
      }
      return '<img class="blog-card-media" src="' + escapeAttr(post.image) + '" alt="' + escapeAttr(post.imageAlt) + '" loading="lazy" decoding="async" data-fallback-thumb data-fallback-label="' + escapeAttr(fallbackLabel(post.title)) + '">';
    }

    function renderTagButtons(post) {
      return (post.tags || []).slice(0, 3).map(function (tag) {
        return '<button class="tag-filter" type="button" data-blog-tag="' + escapeAttr(tag) + '">' + escapeHtml(tag) + "</button>";
      }).join("");
    }

    function renderCard(post) {
      const meta = ['<span class="meta-pill">' + escapeHtml(post.category) + "</span>", '<span class="meta-pill">' + escapeHtml(post.readTime) + "</span>", '<span class="meta-pill">' + escapeHtml(post.date) + "</span>"].join("");
      const tags = (post.tags || []).length ? '<div class="blog-card-tags">' + renderTagButtons(post) + "</div>" : "";
      return [
        '<article class="blog-card" data-blog-card data-blog-result data-category="', escapeAttr(post.category), '" data-tags="', escapeAttr((post.tags || []).join("|")), '" data-search="', escapeAttr(post.searchText || ""), '">',
        renderPostImage(post),
        '<div class="meta-row">', meta, "</div>",
        '<h3><a class="blog-card-title-link" href="', escapeAttr(post.url), '">', escapeHtml(post.title), "</a></h3>",
        "<p>", escapeHtml(post.excerpt), "</p>",
        tags,
        '<div class="button-row"><a class="btn btn-secondary" href="', escapeAttr(post.url), '">Read More</a></div>',
        "</article>"
      ].join("");
    }

    function bindGridImageFallbacks() {
      if (!grid) return;
      grid.querySelectorAll("img[data-fallback-thumb]").forEach(function (image) {
        if (image.dataset.fallbackBound === "true") return;
        image.dataset.fallbackBound = "true";
        image.addEventListener("error", function () {
          if (!image.getAttribute("src")) return;
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

    function getCategoryButtons() {
      return Array.from(hub.querySelectorAll("[data-blog-category]"));
    }

    function getTagButtons() {
      return Array.from(hub.querySelectorAll("[data-blog-tag]"));
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
      getCategoryButtons().forEach(function (button) {
        const isActive = normalize(button.getAttribute("data-blog-category")) === normalize(activeCategory);
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
      getTagButtons().forEach(function (button) {
        const isActive = normalize(button.getAttribute("data-blog-tag")) === normalize(activeTag);
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    function getFilteredPosts() {
      const rawQuery = search ? search.value : "";
      const normalizedQuery = normalize(rawQuery);
      return posts.filter(function (post) {
        const categoryMatches = normalize(activeCategory) === "all" || normalize(post.categoryKey || post.category) === normalize(activeCategory);
        const tagMatches = !activeTag || (post.tagKeys || []).includes(normalize(activeTag));
        const searchMatches = !normalizedQuery || normalize(post.searchText || "").includes(normalizedQuery);
        return categoryMatches && tagMatches && searchMatches;
      });
    }

    function applyFilters() {
      const query = search ? search.value.trim() : "";
      const filteredPosts = getFilteredPosts();
      const isFiltering = normalize(query).length > 0 || normalize(activeCategory) !== "all" || normalize(activeTag).length > 0;
      if (grid) {
        grid.innerHTML = filteredPosts.map(renderCard).join("");
        grid.hidden = filteredPosts.length === 0;
      }
      bindGridImageFallbacks();
      if (count) count.textContent = String(filteredPosts.length);
      if (total) total.textContent = String(posts.length);
      if (empty) empty.hidden = filteredPosts.length !== 0;
      hub.classList.toggle("is-filtering", isFiltering);
      clearButtons.forEach(function (button) {
        button.hidden = !isFiltering;
      });
      if (searchClearButton) {
        const searchActive = normalize(query).length > 0;
        searchClearButton.hidden = !searchActive;
        searchClearButton.disabled = !searchActive;
      }
      syncActiveButtons();
      setUrl(query);
    }

    hub.addEventListener("click", function (event) {
      const categoryButton = event.target.closest("[data-blog-category]");
      if (categoryButton) {
        activeCategory = categoryButton.getAttribute("data-blog-category") || "All";
        applyFilters();
        return;
      }

      const tagButton = event.target.closest("[data-blog-tag]");
      if (tagButton) {
        const tag = tagButton.getAttribute("data-blog-tag") || "";
        activeTag = normalize(activeTag) === normalize(tag) ? "" : tag;
        applyFilters();
        return;
      }

      const clearSearch = event.target.closest("[data-blog-search-clear]");
      if (clearSearch) {
        if (search) search.value = "";
        applyFilters();
        if (search) search.focus();
        return;
      }

      const clearFilters = event.target.closest("[data-blog-clear]");
      if (clearFilters) {
        activeCategory = "All";
        activeTag = "";
        if (search) search.value = "";
        applyFilters();
        if (search) search.focus();
      }
    });

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    if (tagToggleButton && extraTags) {
      tagToggleButton.addEventListener("click", function () {
        extraTags.toggleAttribute("hidden");
        const isHidden = extraTags.hasAttribute("hidden");
        tagToggleButton.textContent = isHidden ? "Show more tags" : "Show fewer tags";
        tagToggleButton.setAttribute("aria-expanded", String(!isHidden));
      });
    }

    bindGridImageFallbacks();
    applyFilters();
  }

  function bindImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      if (image.closest("[data-lightbox]")) return;
      image.addEventListener("error", function () {
        if (!image.getAttribute("src")) return;
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
      const slidesTrack = carousel.querySelector(".book-slides");
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

      function syncHeight() {
        if (!slidesTrack) return;
        const activeSlide = slides[activeIndex];
        if (!activeSlide) return;
        window.requestAnimationFrame(function () {
          slidesTrack.style.height = activeSlide.offsetHeight + "px";
        });
      }

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
        syncHeight();
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

      window.addEventListener("resize", syncHeight);
      window.addEventListener("load", syncHeight, { once: true });

      render(false);
      start();
    });
  }

  function bindRecognitionCarousel() {
    document.querySelectorAll("[data-recognition-carousel]").forEach(function (carousel) {
      const slides = Array.from(carousel.querySelectorAll("[data-recognition-slide]"));
      const previous = carousel.querySelector("[data-recognition-prev]");
      const next = carousel.querySelector("[data-recognition-next]");
      const current = carousel.querySelector("[data-recognition-current]");
      const total = carousel.querySelector("[data-recognition-total]");
      const selectors = Array.from(carousel.querySelectorAll("[data-recognition-select]"));
      if (!slides.length) return;

      let activeIndex = 0;
      let timer = 0;
      let pointerInside = false;
      let focusInside = false;

      function render() {
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
      }

      function goTo(index, manual) {
        activeIndex = (index + slides.length) % slides.length;
        render();
        if (manual) restart();
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
        }, 5000);
      }

      function restart() {
        stop();
        window.setTimeout(start, 250);
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
        });
      });

      carousel.addEventListener("keydown", function (event) {
        if (event.target && event.target.hasAttribute && event.target.hasAttribute("data-recognition-select")) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goTo(activeIndex + 1, true);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
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

      render();
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
  bindRecognitionCarousel();
  bindImageFallbacks();
  window.addEventListener("scroll", handleScrollHeader, { passive: true });
})();
