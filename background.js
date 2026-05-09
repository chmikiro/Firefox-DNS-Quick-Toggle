browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'setDNS') {
    const { url, name } = msg;
    if (!url) {
      browser.storage.local.set({ activeUrl: null, activeName: null });
      browser.browserAction.setBadgeText({ text: '' });
      return Promise.resolve({ ok: true });
    }
    browser.storage.local.set({ activeUrl: url, activeName: name });
    browser.browserAction.setBadgeText({ text: name.slice(0, 2).toUpperCase() });
    browser.browserAction.setBadgeBackgroundColor({ color: '#4f98a3' });
    return Promise.resolve({ ok: true });
  }
  if (msg.action === 'openSettings') {
    browser.tabs.create({ url: 'about:preferences#privacy' });
  }
  return Promise.resolve({});
});