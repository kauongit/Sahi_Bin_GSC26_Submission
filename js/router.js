/**
 * Sahi Bin - Hash-Based SPA Router
 * Supports parameterized routes, auth/role guards, transitions, and history.
 */

import { store } from './state.js';

class Router {
  constructor() {
    /** @type {Array<{path: string, pattern: RegExp, paramNames: string[], render: Function, options: Object}>} */
    this.routes = [];
    this.currentRoute = null;
    this.historyStack = [];
    this.container = null;
    this._transitioning = false;
  }

  /**
   * Initialize the router: grab the container, bind hashchange, and handle the initial route.
   * @param {string} containerId - ID of the DOM element to render screens into
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`[Router] Container #${containerId} not found`);
      return;
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => this._onHashChange());

    // Handle the initial route
    this._onHashChange();
  }

  /**
   * Register a route.
   * @param {string} path - Hash path, e.g. '#/worker/household/:id'
   * @param {Function} renderFn - Render function(container, params)
   * @param {Object} options - { guard: 'auth'|'guest'|null, role: 'worker'|'citizen'|null, title: string }
   */
  addRoute(path, renderFn, options = {}) {
    const paramNames = [];
    
    // Extract parameter names and replace with placeholder
    const cleanPath = path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name);
      return '___PARAM___';
    });

    // Escape regex characters in clean path, then restore parameter matchers
    const patternStr = cleanPath
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/___PARAM___/g, '([^/]+)');

    const pattern = new RegExp(`^${patternStr}$`);

    this.routes.push({
      path,
      pattern,
      paramNames,
      render: renderFn,
      options: {
        guard: options.guard || null,
        role: options.role || null,
        title: options.title || 'Sahi Bin'
      }
    });
  }

  /**
   * Navigate to a given hash path.
   * @param {string} path - Target hash path, e.g. '#/worker/dashboard'
   * @param {Object} params - Additional params to pass to the render function
   * @param {Object} options - { replace: boolean, direction: 'forward'|'back' }
   */
  async navigate(path, params = {}, options = { replace: false, direction: 'forward' }) {
    if (this._transitioning) return;

    const match = this._matchRoute(path);

    if (!match) {
      console.warn(`[Router] No route found for: ${path}`);
      this._renderNotFound();
      return;
    }

    const { route, extractedParams } = match;
    const mergedParams = { ...extractedParams, ...params };

    // --- Guard checks ---
    const user = store.get('currentUser');

    if (route.options.guard === 'auth' && !user) {
      // Redirect to landing if not authenticated
      window.location.hash = '#/';
      return;
    }

    if (route.options.guard === 'guest' && user) {
      // Redirect authenticated users to their dashboard
      const role = user.role;
      if (role === 'worker') {
        window.location.hash = '#/worker/dashboard';
      } else {
        window.location.hash = '#/citizen/dashboard';
      }
      return;
    }

    if (route.options.role && user && user.role !== route.options.role) {
      // Wrong role — redirect to correct dashboard
      const role = user.role;
      if (role === 'worker') {
        window.location.hash = '#/worker/dashboard';
      } else {
        window.location.hash = '#/citizen/dashboard';
      }
      return;
    }

    // --- Transition animation ---
    this._transitioning = true;

    try {
      await this._animateOut(options.direction);

      // Update history stack
      if (!options.replace && this.currentRoute) {
        this.historyStack.push(this.currentRoute);
        // Cap history at 50 entries
        if (this.historyStack.length > 50) this.historyStack.shift();
      }

      // Set current route
      this.currentRoute = { path, params: mergedParams, route };
      store.set('currentRoute', path);

      // Update document title
      document.title = route.options.title
        ? `${route.options.title} — Sahi Bin`
        : 'Sahi Bin';

      // Update hash without re-triggering navigate (if not already set)
      if (window.location.hash !== path) {
        this._skipNextHashChange = true;
        if (options.replace) {
          window.history.replaceState(null, '', path);
        } else {
          window.history.pushState(null, '', path);
        }
      }

      // Render
      await route.render(this.container, mergedParams);

      await this._animateIn(options.direction);
    } catch (err) {
      console.error('[Router] Render error:', err);
      this._renderError(err);
    } finally {
      this._transitioning = false;
    }
  }

  /**
   * Go back one step in the internal history stack.
   */
  goBack() {
    if (this.historyStack.length > 0) {
      const prev = this.historyStack.pop();
      this.navigate(prev.path, prev.params, { replace: true, direction: 'back' });
    } else {
      // Fallback: go to the role-appropriate dashboard or landing
      const user = store.get('currentUser');
      if (user) {
        const dash = user.role === 'worker' ? '#/worker/dashboard' : '#/citizen/dashboard';
        this.navigate(dash, {}, { replace: true, direction: 'back' });
      } else {
        this.navigate('#/', {}, { replace: true, direction: 'back' });
      }
    }
  }

  /**
   * Get current route params (from the matched route).
   * @returns {Object}
   */
  getCurrentParams() {
    return this.currentRoute ? this.currentRoute.params : {};
  }

  /**
   * Get the current matched path.
   * @returns {string|null}
   */
  getCurrentPath() {
    return this.currentRoute ? this.currentRoute.path : null;
  }

  // ----- Private Methods -----

  /**
   * Handle hashchange event.
   */
  _onHashChange() {
    if (this._skipNextHashChange) {
      this._skipNextHashChange = false;
      return;
    }

    const hash = window.location.hash || '#/';
    this.navigate(hash, {}, { replace: false, direction: 'forward' });
  }

  /**
   * Match a hash string against registered routes.
   * @param {string} hash
   * @returns {{ route: Object, extractedParams: Object } | null}
   */
  _matchRoute(hash) {
    for (const route of this.routes) {
      const match = hash.match(route.pattern);
      if (match) {
        const extractedParams = {};
        route.paramNames.forEach((name, i) => {
          extractedParams[name] = decodeURIComponent(match[i + 1]);
        });
        return { route, extractedParams };
      }
    }
    return null;
  }

  /**
   * Animate the current screen out.
   * @param {'forward'|'back'} direction
   */
  async _animateOut(direction) {
    if (!this.container || !this.container.firstElementChild) return;

    const el = this.container.firstElementChild;
    const translateX = direction === 'back' ? '30px' : '-30px';

    el.style.transition = 'opacity 150ms ease, transform 150ms ease';
    el.style.opacity = '0';
    el.style.transform = `translateX(${translateX})`;

    return new Promise(resolve => setTimeout(resolve, 150));
  }

  /**
   * Animate the new screen in.
   * @param {'forward'|'back'} direction
   */
  async _animateIn(direction) {
    if (!this.container || !this.container.firstElementChild) return;

    const el = this.container.firstElementChild;
    const startX = direction === 'back' ? '-30px' : '30px';

    el.style.opacity = '0';
    el.style.transform = `translateX(${startX})`;

    // Force reflow
    void el.offsetHeight;

    el.style.transition = 'opacity 200ms ease, transform 200ms ease';
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';

    return new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Render a 404 Not Found screen.
   */
  _renderNotFound() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="screen screen--error" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;padding:24px;text-align:center;">
        <h1 style="font-family:'Inter',sans-serif;font-weight:900;font-style:italic;font-size:4rem;color:#1B6B3C;margin-bottom:12px;">404</h1>
        <p style="font-family:'Inter',sans-serif;font-size:1.125rem;color:#1A1A1A;margin-bottom:24px;">यह पेज नहीं मिला</p>
        <button onclick="window.location.hash='#/'" style="
          font-family:'Inter',sans-serif;font-weight:700;font-size:1rem;
          padding:12px 32px;border:3px solid #1A1A1A;border-radius:12px;
          background:#1B6B3C;color:#fff;cursor:pointer;
          box-shadow:4px 4px 0px #1A1A1A;min-height:48px;">
          वापस जाएं
        </button>
      </div>
    `;
  }

  /**
   * Render an error screen.
   * @param {Error} err
   */
  _renderError(err) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="screen screen--error" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;padding:24px;text-align:center;">
        <h1 style="font-family:'Inter',sans-serif;font-weight:900;font-style:italic;font-size:2rem;color:#D32F2F;margin-bottom:12px;">त्रुटि</h1>
        <p style="font-family:'Inter',sans-serif;font-size:1rem;color:#1A1A1A;margin-bottom:8px;">कुछ गड़बड़ हो गई</p>
        <p style="font-family:'Inter',sans-serif;font-size:0.875rem;color:#666;margin-bottom:24px;">${err.message || 'Unknown error'}</p>
        <button onclick="window.location.reload()" style="
          font-family:'Inter',sans-serif;font-weight:700;font-size:1rem;
          padding:12px 32px;border:3px solid #1A1A1A;border-radius:12px;
          background:#D32F2F;color:#fff;cursor:pointer;
          box-shadow:4px 4px 0px #1A1A1A;min-height:48px;">
          पुनः प्रयास करें
        </button>
      </div>
    `;
  }
}

export const router = new Router();
