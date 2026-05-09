const DEFAULT_PROVIDERS = [
  { name: "Mullvad", url: "https://doh.mullvad.net/dns-query", tag: "no-log" },
  { name: "Mullvad (adblock)", url: "https://adblock.doh.mullvad.net/dns-query", tag: "adblock" },
  { name: "Mullvad (extended)", url: "https://extended.doh.mullvad.net/dns-query", tag: "adblock+" },
  { name: "Cloudflare", url: "https://cloudflare-dns.com/dns-query", tag: null },
  { name: "Cloudflare (security)", url: "https://security.cloudflare-dns.com/dns-query", tag: "malware" },
  { name: "NextDNS", url: "https://dns.nextdns.io", tag: null },
  { name: "Quad9", url: "https://dns.quad9.net/dns-query", tag: "malware" },
  { name: "AdGuard", url: "https://dns.adguard-dns.com/dns-query", tag: "adblock" },
  { name: "Control D", url: "https://freedns.controld.com/p0", tag: null },
];

const dnsList = document.getElementById('dns-list');
const activeBadge = document.getElementById('active-badge');
const addName = document.getElementById('add-name');
const addUrl = document.getElementById('add-url');
const addBtn = document.getElementById('add-btn');
const disableBtn = document.getElementById('disable-btn');
const errorMsg = document.getElementById('error-msg');
const statusNotice = document.getElementById('status-notice');

document.getElementById('open-settings').addEventListener('click', (e) => {
  e.preventDefault();
  browser.tabs.create({ url: 'about:preferences#privacy' });
});

function isValidDoH(url) {
  try { const u = new URL(url); return u.protocol === 'https:'; } catch { return false; }
}

function showStatus(msg, type = 'info') {
  statusNotice.textContent = msg;
  statusNotice.className = 'notice' + (type === 'success' ? ' success' : '');
  setTimeout(() => {
    statusNotice.innerHTML = 'ℹ️ Click a provider to mark active + copy URL. Open <a href="#" id="open-settings">about:preferences#privacy →</a> to apply.';
    statusNotice.className = 'notice';
    document.getElementById('open-settings').addEventListener('click', (e) => {
      e.preventDefault();
      browser.tabs.create({ url: 'about:preferences#privacy' });
    });
  }, 3000);
}

function updateBadge(activeUrl, providers) {
  const active = providers.find(p => p.url === activeUrl);
  if (active) {
    activeBadge.textContent = active.name;
    activeBadge.className = 'active-badge';
    try { browser.browserAction.setBadgeText({ text: active.name.slice(0, 2).toUpperCase() }); } catch(e) {}
    try { browser.browserAction.setBadgeBackgroundColor({ color: '#4f98a3' }); } catch(e) {}
  } else {
    activeBadge.textContent = 'None';
    activeBadge.className = 'active-badge none';
    try { browser.browserAction.setBadgeText({ text: '' }); } catch(e) {}
  }
}

function renderList(providers, activeUrl) {
  dnsList.innerHTML = '';
  if (!providers.length) {
    dnsList.innerHTML = '<div style="color:var(--text-faint);font-size:11px;padding:12px 0;text-align:center">No providers.</div>';
    return;
  }
  providers.forEach((p, idx) => {
    const isActive = activeUrl && p.url === activeUrl;
    const item = document.createElement('div');
    item.className = 'dns-item' + (isActive ? ' active' : '');
    item.innerHTML = `
      <div class="dns-dot"></div>
      <div class="dns-info">
        <div class="dns-name">${p.name}${p.tag ? `<span class="tag">${p.tag}</span>` : ''}</div>
        <div class="dns-url">${p.url}</div>
      </div>
      <div class="dns-actions">
        <button class="btn-icon" title="Copy URL" data-copy="${p.url}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="btn-icon delete" title="Remove" data-idx="${idx}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>`;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-icon')) return;
      browser.storage.local.set({ activeUrl: p.url, activeName: p.name });
      navigator.clipboard.writeText(p.url).catch(() => {});
      showStatus(`✓ ${p.name} set active — URL copied to clipboard`, 'success');
      renderList(providers, p.url);
      updateBadge(p.url, providers);
    });

    item.querySelector('[data-copy]').addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(p.url).catch(() => {});
      const btn = e.currentTarget;
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => { btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'; }, 1500);
    });

    item.querySelector('[data-idx]').addEventListener('click', (e) => {
      e.stopPropagation();
      providers.splice(idx, 1);
      const newActive = activeUrl === p.url ? null : activeUrl;
      browser.storage.local.set({ providers, activeUrl: newActive });
      renderList(providers, newActive);
      updateBadge(newActive, providers);
    });

    dnsList.appendChild(item);
  });
}

function load() {
  browser.storage.local.get(['providers', 'activeUrl']).then((r) => {
    const providers = r.providers || DEFAULT_PROVIDERS;
    const activeUrl = r.activeUrl || null;
    if (!r.providers) browser.storage.local.set({ providers: DEFAULT_PROVIDERS });
    renderList(providers, activeUrl);
    updateBadge(activeUrl, providers);
  }).catch((err) => {
    dnsList.innerHTML = '<div style="color:var(--error);font-size:11px;padding:12px 0;text-align:center">Storage error: ' + err.message + '</div>';
  });
}

addBtn.addEventListener('click', () => {
  const name = addName.value.trim();
  const url = addUrl.value.trim();
  if (!isValidDoH(url)) { errorMsg.classList.add('visible'); return; }
  errorMsg.classList.remove('visible');
  browser.storage.local.get(['providers']).then((r) => {
    const providers = r.providers || DEFAULT_PROVIDERS;
    providers.push({ name: name || new URL(url).hostname, url, tag: null });
    browser.storage.local.set({ providers });
    addName.value = ''; addUrl.value = '';
    load();
  });
});

disableBtn.addEventListener('click', () => {
  browser.storage.local.set({ activeUrl: null, activeName: null });
  try { browser.browserAction.setBadgeText({ text: '' }); } catch(e) {}
  showStatus('DoH disabled — using browser default');
  load();
});

addUrl.addEventListener('input', () => errorMsg.classList.remove('visible'));
load();