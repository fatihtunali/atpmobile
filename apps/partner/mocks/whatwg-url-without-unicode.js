// Mock for whatwg-url-without-unicode to avoid SharedArrayBuffer issues in React Native

class URLSearchParams {
  constructor(init) {
    this._entries = [];
    if (typeof init === 'string') {
      const query = init.startsWith('?') ? init.slice(1) : init;
      if (query) {
        query.split('&').forEach(pair => {
          const [key, value = ''] = pair.split('=').map(decodeURIComponent);
          this._entries.push([key, value]);
        });
      }
    } else if (init && typeof init === 'object') {
      if (Array.isArray(init)) {
        this._entries = init.map(([k, v]) => [String(k), String(v)]);
      } else {
        Object.entries(init).forEach(([k, v]) => this._entries.push([k, String(v)]));
      }
    }
  }
  append(name, value) { this._entries.push([String(name), String(value)]); }
  delete(name) { this._entries = this._entries.filter(([k]) => k !== name); }
  get(name) { const e = this._entries.find(([k]) => k === name); return e ? e[1] : null; }
  getAll(name) { return this._entries.filter(([k]) => k === name).map(([, v]) => v); }
  has(name) { return this._entries.some(([k]) => k === name); }
  set(name, value) { this.delete(name); this.append(name, value); }
  keys() { return this._entries.map(([k]) => k)[Symbol.iterator](); }
  values() { return this._entries.map(([, v]) => v)[Symbol.iterator](); }
  entries() { return this._entries[Symbol.iterator](); }
  forEach(cb, thisArg) { this._entries.forEach(([k, v]) => cb.call(thisArg, v, k, this)); }
  toString() { return this._entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }
  [Symbol.iterator]() { return this.entries(); }
}

class URL {
  constructor(url, base) {
    let fullUrl = url;
    if (base) {
      try {
        const baseUrl = new URL(base);
        if (url.startsWith('/')) {
          fullUrl = baseUrl.origin + url;
        } else if (!url.match(/^[a-z]+:/i)) {
          fullUrl = baseUrl.href.replace(/[^/]*$/, '') + url;
        }
      } catch (e) {
        fullUrl = url;
      }
    }
    const match = fullUrl.match(/^([a-z][a-z0-9+.-]*):\/\/([^/:]+)(:\d+)?([^?#]*)?(\?[^#]*)?(#.*)?$/i);
    if (match) {
      this.protocol = match[1] + ':';
      this.hostname = match[2] || '';
      this.port = match[3] ? match[3].slice(1) : '';
      this.pathname = match[4] || '/';
      this.search = match[5] || '';
      this.hash = match[6] || '';
    } else {
      this.protocol = '';
      this.hostname = '';
      this.port = '';
      this.pathname = fullUrl;
      this.search = '';
      this.hash = '';
    }
    this.host = this.port ? `${this.hostname}:${this.port}` : this.hostname;
    this.origin = this.protocol ? `${this.protocol}//${this.host}` : '';
    this.href = this.origin + this.pathname + this.search + this.hash;
    this.searchParams = new URLSearchParams(this.search);
  }
  toString() { return this.href; }
  toJSON() { return this.href; }
}

module.exports = { URL, URLSearchParams };
