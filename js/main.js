/**
 * mylead — main.js
 * Handles: Navigation, GSAP scroll animations, Modal, FAQ accordion, Forms, Footer year
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITIES
     ============================================================ */

  /**
   * Safely query a single DOM element.
   * @param {string} selector
   * @param {Element} [context=document]
   * @returns {Element|null}
   */
  function qs(selector, context) {
    return (context || document).querySelector(selector);
  }

  /**
   * Safely query all matching DOM elements.
   * @param {string} selector
   * @param {Element} [context=document]
   * @returns {NodeList}
   */
  function qsa(selector, context) {
    return (context || document).querySelectorAll(selector);
  }

  /* ============================================================
     FOOTER — DYNAMIC COPYRIGHT YEAR
     ============================================================ */
  function initFooterYear() {
    const yearEl = qs('#footerYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ============================================================
     NAVIGATION — STICKY + MOBILE TOGGLE
     ============================================================ */
  function initNavigation() {
    const header    = qs('.site-header');
    const toggle    = qs('#navToggle');
    const menu      = qs('#navMenu');
    const navLinks  = qsa('.nav-link');

    if (!header || !toggle || !menu) return;

    // Sticky header shadow on scroll
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle('scrolled', !entry.isIntersecting);
      },
      { rootMargin: '-72px 0px 0px 0px' }
    );

    const heroEl = qs('#hero');
    if (heroEl) headerObserver.observe(heroEl);

    // Mobile nav toggle
    function openMenu() {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Close menu when a nav link is clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ============================================================
     GSAP SCROLL ANIMATIONS
     ============================================================ */
  function initAnimations() {
    // Guard: GSAP and ScrollTrigger must both be available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Fallback: make all animated elements visible immediately
      qsa('.gs-fade-up, .gs-slide-left, .gs-slide-right, .gs-stagger').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Respect user's reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      qsa('.gs-fade-up, .gs-slide-left, .gs-slide-right, .gs-stagger').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Shared trigger defaults
    const triggerDefaults = {
      start: 'top 88%',
      toggleActions: 'play none none none',
    };

    // --- Fade up (general elements) ---
    qsa('.gs-fade-up').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          ...triggerDefaults,
        },
      });
    });

    // --- Slide in from left ---
    qsa('.gs-slide-left').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          ...triggerDefaults,
        },
      });
    });

    // --- Slide in from right ---
    qsa('.gs-slide-right').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          ...triggerDefaults,
        },
      });
    });

    // --- Staggered grid items (services) ---
    const staggerGroups = qsa('.services-grid, .ecom-stats');
    staggerGroups.forEach((group) => {
      const items = qsa('.gs-stagger', group);
      if (!items.length) return;

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: group,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });
    });

    // --- Hero elements: orchestrated entrance on load ---
    const heroElements = qsa('.hero .gs-fade-up');
    if (heroElements.length) {
      gsap.to(heroElements, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
        delay: 0.2,
      });
    }

    // Stat number counter animation
    qsa('.stat-number').forEach((el) => {
      const rawText = el.textContent;
      const numMatch = rawText.match(/[\d.]+/);
      if (!numMatch) return;

      const targetNum = parseFloat(numMatch[0]);
      const suffix = rawText.replace(numMatch[0], '');
      const isDecimal = rawText.includes('.');

      gsap.from({ val: 0 }, {
        val: targetNum,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate: function () {
          const current = isDecimal
            ? this.targets()[0].val.toFixed(1)
            : Math.round(this.targets()[0].val);
          el.textContent = current + suffix;
        },
      });
    });
  }

  /* ============================================================
     MODAL — GET A QUOTE
     ============================================================ */
  function initModal() {
    const modal      = qs('#quoteModal');
    const closeBtn   = qs('#modalClose');
    const triggers   = qsa('[data-modal-trigger]');
    const navCtaBtn  = qs('#navCta');

    if (!modal) return;

    // Collect all triggers
    const allTriggers = [...triggers];
    if (navCtaBtn) allTriggers.push(navCtaBtn);

    function openModal() {
      modal.removeAttribute('hidden');
      // Defer to next frame to allow CSS transition to run
      requestAnimationFrame(() => {
        modal.classList.add('is-open');
      });
      document.body.style.overflow = 'hidden';

      // Move focus into modal
      const firstFocusable = modal.querySelector('input, select, textarea, button');
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 50);
      }
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';

      // Hide after transition completes
      modal.addEventListener(
        'transitionend',
        () => {
          if (!modal.classList.contains('is-open')) {
            modal.setAttribute('hidden', '');
          }
        },
        { once: true }
      );
    }

    // Open triggers
    allTriggers.forEach((trigger) => {
      trigger.addEventListener('click', openModal);
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Click outside modal container to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Focus trap inside modal
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusableEls = modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableEls[0];
      const last  = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Quote form submission
    const quoteForm    = qs('#quoteForm');
    const quoteSuccess = qs('#quoteSuccess');

    if (quoteForm) {
      quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!quoteForm.checkValidity()) {
          quoteForm.reportValidity();
          return;
        }

        // Simulate async submission
        const submitBtn = quoteForm.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.textContent = 'Sending...';
          submitBtn.disabled = true;
        }

        setTimeout(() => {
          quoteForm.reset();
          if (quoteSuccess) {
            quoteSuccess.removeAttribute('hidden');
          }
          if (submitBtn) {
            submitBtn.textContent = 'Submit My Request';
            submitBtn.disabled = false;
          }

          // Hide success after 5 seconds
          setTimeout(() => {
            if (quoteSuccess) quoteSuccess.setAttribute('hidden', '');
          }, 5000);
        }, 1000);
      });
    }
  }

  /* ============================================================
     FAQ — ACCORDION
     ============================================================ */
  function initFaq() {
    const faqItems = qsa('.faq-item');

    faqItems.forEach((item) => {
      const question = qs('.faq-question', item);
      const answerId = question && question.getAttribute('aria-controls');
      const answer   = answerId ? qs('#' + answerId) : null;

      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';

        // Close all other items first
        faqItems.forEach((otherItem) => {
          const otherQ = qs('.faq-question', otherItem);
          const otherAId = otherQ && otherQ.getAttribute('aria-controls');
          const otherA   = otherAId ? qs('#' + otherAId) : null;

          if (otherQ && otherQ !== question) {
            otherQ.setAttribute('aria-expanded', 'false');
          }
          if (otherA && otherA !== answer) {
            otherA.setAttribute('hidden', '');
          }
        });

        // Toggle current item
        if (isExpanded) {
          question.setAttribute('aria-expanded', 'false');
          answer.setAttribute('hidden', '');
        } else {
          question.setAttribute('aria-expanded', 'true');
          answer.removeAttribute('hidden');
        }
      });
    });
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  function initContactForm() {
    const form    = qs('#contactForm');
    const success = qs('#contactSuccess');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      // Simulate async submission
      setTimeout(() => {
        form.reset();
        if (success) {
          success.removeAttribute('hidden');
        }
        if (submitBtn) {
          submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
          submitBtn.disabled = false;
        }

        setTimeout(() => {
          if (success) success.setAttribute('hidden', '');
        }, 6000);
      }, 900);
    });
  }

  /* ============================================================
     SMOOTH SCROLL — anchor link refinement
     ============================================================ */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = qs(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initFooterYear();
    initNavigation();
    initFaq();
    initModal();
    initContactForm();
    initSmoothScroll();

    // GSAP animations: run after DOM is ready and GSAP is loaded
    if (document.readyState === 'complete') {
      initAnimations();
    } else {
      window.addEventListener('load', initAnimations);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
