(function () {
  const topbar = document.getElementById("topbar");
  const nav = document.getElementById("nav");
  const menuBtn = document.getElementById("menu-btn");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const galleryImages = [
    "academic-rediness-proramme-for-students-bishop-moore-vidyapith-cherthala-sanjo-mathew-trainer.png",
    "creative-thinking-session-unity-womens-college-malappuram-sanjo-mathew-trainer.jpg",
    "learning-science-experimental-way-sri-vijaya-vidaya-metric-school-salem-tamil-nadu-sanjo-mathew-trainer.jpg",
    "makam-english-medium-public-school-trivandrum-sanjo-mathew-trainer.jpeg",
    "mathi-coding-ai-residentail-summer-camp-nit-calicut-sanjo-mathew-trainer.jpg",
    "parents-orientation-program-vimala-central-school-chathanoor-kollam-sanjo-mathew-trainer.jpeg",
    "parents-orientation-programme-de-paul-school-thodupuzha-idukki-sanjo-mathew-trainer.jpeg",
    "parents-orientation-programme-st-maria-goretti-public-school-ernakulam-sanjo-mathew-trainer.jpeg",
    "school-reopening-njanodayam-public-school-edakochi-ernakulam-sanjo-mathew-trainer.jpg",
    "students-training-programme-caarmel-english-medium-school-ernakulam-sanjo-mathew-trainer.jpeg",
    "teachers-training-programme-gregorian-public-school-kottayam-sanjo-mathew-trainer.jpg",
    "teachers-training-programme-st-marys-english-medium-school-kollam-sanjo-mathew-trainer.jpeg"
  ];

  function setYear() {
    const yearNode = document.getElementById("year");
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

  function bindActiveNav() {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const links = Array.from(document.querySelectorAll(".nav a[href^='#']"));
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function renderGallery() {
    const container = document.getElementById("gallery-grid");
    if (!container) return;

    function buildAltText(filename) {
      const normalized = filename
        .replace(/\.[^.]+$/, "")
        .replace(/sanjo-mathew-trainer/gi, "")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return "Sanjo Mathew workshop session: " + normalized;
    }

    galleryImages.forEach(function (name) {
      const article = document.createElement("article");
      article.className = "gallery-item";
      article.setAttribute("role", "button");
      article.setAttribute("tabindex", "0");

      const img = document.createElement("img");
      img.src = "assets/imgs/gallery/" + name;
      img.alt = buildAltText(name);
      img.loading = "lazy";
      img.decoding = "async";

      function openLightbox() {
        const lightbox = document.getElementById("gallery-lightbox");
        const lightboxImage = document.getElementById("gallery-lightbox-image");
        if (!lightbox || !lightboxImage) return;
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      }

      article.addEventListener("click", openLightbox);
      article.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox();
        }
      });

      article.appendChild(img);
      container.appendChild(article);
    });
  }

  function bindLightbox() {
    const lightbox = document.getElementById("gallery-lightbox");
    const closeButton = document.getElementById("gallery-lightbox-close");
    if (!lightbox || !closeButton) return;

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("open")) {
        closeLightbox();
      }
    });
  }

  function bindReveals() {
    const sectionNodes = Array.from(document.querySelectorAll(".reveal"));
    const staggerGroups = [
      ".expertise-grid .card",
      ".program-grid .program-card",
      ".audience-grid .audience-card",
      ".stats-grid article",
      "#contact .contact-grid .panel"
    ];
    const itemNodes = [];

    staggerGroups.forEach(function (selector) {
      const group = Array.from(document.querySelectorAll(selector));
      group.forEach(function (node, index) {
        node.classList.add("reveal-item");
        node.style.setProperty("--stagger", String(index));
        itemNodes.push(node);
      });
    });

    const allNodes = sectionNodes.concat(itemNodes);
    const heroSection = document.getElementById("hero");

    if (!allNodes.length && !heroSection) return;

    if (prefersReducedMotion) {
      allNodes.forEach(function (node) {
        node.classList.add("visible");
      });
      if (heroSection) {
        heroSection.classList.add("hero-inview");
      }
      return;
    }

    document.body.classList.add("js-motion");

    allNodes.forEach(function (node) {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        node.classList.add("visible");
      }
    });

    if (heroSection) {
      requestAnimationFrame(function () {
        heroSection.classList.add("hero-inview");
      });
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    allNodes.forEach(function (node) {
      if (node.classList.contains("visible")) return;
      observer.observe(node);
    });
  }

  function bindCounters() {
    const impactSection = document.getElementById("impact");
    const counters = Array.from(document.querySelectorAll(".count-up[data-count]"));
    if (!impactSection || !counters.length) return;

    if (prefersReducedMotion) {
      counters.forEach(function (counter) {
        counter.textContent = counter.getAttribute("data-count");
      });
      return;
    }

    let hasAnimated = false;

    function animateCounter(node, targetValue) {
      const startTime = performance.now();
      const duration = 1200;

      function step(now) {
        const elapsed = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const value = Math.floor(targetValue * eased);
        node.textContent = String(value);

        if (elapsed < 1) {
          requestAnimationFrame(step);
        } else {
          node.textContent = String(targetValue);
        }
      }

      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || hasAnimated) return;
          hasAnimated = true;

          counters.forEach(function (counter) {
            const target = Number(counter.getAttribute("data-count"));
            if (!Number.isFinite(target)) return;
            animateCounter(counter, target);
          });

          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(impactSection);
  }

  function bindHeroTypewriter() {
    const title = document.querySelector("#hero .hero-title");
    if (!title) return;

    const originalHTML = title.innerHTML;
    const fullText = title.textContent.trim();
    if (!fullText) return;

    if (prefersReducedMotion) {
      title.innerHTML = originalHTML;
      return;
    }

    const nodes = Array.from(title.childNodes).map(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return { type: "text", text: node.textContent || "" };
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        return {
          type: "element",
          tagName: node.nodeName.toLowerCase(),
          text: node.textContent || "",
          className: node.className || ""
        };
      }

      return null;
    }).filter(Boolean);

    // Keep heading space stable before typing to avoid visual jumps.
    title.style.minHeight = title.offsetHeight + "px";
    title.setAttribute("aria-label", fullText);
    title.classList.add("typewriting");
    title.textContent = "";
    title.classList.add("is-typing");

    const startDelay = 420;
    const charDelay = 36;
    let index = 0;

    function renderTypedTitle(characterCount) {
      let remaining = characterCount;
      const fragment = document.createDocumentFragment();

      nodes.forEach(function (part) {
        if (remaining <= 0) return;

        const typedText = part.text.slice(0, remaining);
        remaining -= typedText.length;

        if (!typedText) return;

        if (part.type === "text") {
          fragment.appendChild(document.createTextNode(typedText));
          return;
        }

        const element = document.createElement(part.tagName);
        if (part.className) {
          element.className = part.className;
        }
        element.textContent = typedText;
        fragment.appendChild(element);
      });

      title.replaceChildren(fragment);
    }

    function typeNext() {
      index += 1;
      renderTypedTitle(index);
      if (index < fullText.length) {
        window.setTimeout(typeNext, charDelay);
      } else {
        title.classList.remove("is-typing");
        title.style.minHeight = "";
        title.innerHTML = originalHTML;
      }
    }

    window.setTimeout(typeNext, startDelay);
  }

  function bindSectionTitleTypewriters() {
    const titles = Array.from(document.querySelectorAll("main .section-head h2"));
    if (!titles.length) return;

    if (prefersReducedMotion) {
      titles.forEach(function (title) {
        title.classList.remove("is-typing");
      });
      return;
    }

    function typeTitle(title) {
      const fullText = title.textContent.trim();
      if (!fullText || title.dataset.typed === "true") return;

      title.dataset.typed = "true";
      title.style.minHeight = title.offsetHeight + "px";
      title.setAttribute("aria-label", fullText);
      title.classList.add("typewriting", "is-typing");
      title.textContent = "";

      let index = 0;
      const charDelay = 24;

      function typeNext() {
        index += 1;
        title.textContent = fullText.slice(0, index);
        if (index < fullText.length) {
          window.setTimeout(typeNext, charDelay);
        } else {
          title.classList.remove("is-typing");
          title.style.minHeight = "";
        }
      }

      window.setTimeout(typeNext, 120);
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          typeTitle(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.45, rootMargin: "0px 0px -12% 0px" }
    );

    titles.forEach(function (title) {
      const rect = title.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        typeTitle(title);
      } else {
        observer.observe(title);
      }
    });
  }

  async function submitForm(formId, buttonId, successMessage, errorMessage) {
    const form = document.getElementById(formId);
    const button = document.getElementById(buttonId);
    if (!form || !button) return;

    button.addEventListener("click", async function (event) {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      event.preventDefault();
      button.disabled = true;

      try {
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData);
        payload.access_key = "f9c83cdc-a3a4-4441-922b-dced7f52a1cd";

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

        alert(successMessage);
        form.reset();
      } catch (error) {
        console.error(error);
        alert(errorMessage);
      } finally {
        button.disabled = false;
      }
    });
  }

  setYear();
  toggleTopbar();
  bindMobileNav();
  bindActiveNav();
  renderGallery();
  bindLightbox();
  bindReveals();
  bindCounters();
  bindHeroTypewriter();
  bindSectionTitleTypewriters();
  submitForm(
    "contactForm",
    "submit",
    "Your request has been sent successfully!",
    "Unable to send your request. Please try again."
  );
  submitForm(
    "appointmentForm",
    "bookAppointmentSubmitBtn",
    "Thank you for reaching out. I appreciate your message and will respond promptly!",
    "Unable to book your appointment. Please try again."
  );

  window.addEventListener("scroll", toggleTopbar, { passive: true });
})();

