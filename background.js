'use strict';

chrome.browserAction.onClicked.addListener(() => {
  chrome.storage.local.get({
    interface: 'manager-new'
  }, prefs => {
    chrome.tabs.create({
      url: 'data/' + prefs.interface + '/index.html'
    });
  });
});

{
  const start = () => {
    chrome.storage.local.get({
      interface: 'manager-new'
    }, prefs => {
      chrome.contextMenus.create({
        id: 'manager-new',
        contexts: ['browser_action'],
        title: 'use new interface',
        type: 'radio',
        checked: prefs.interface === 'manager-new'
      });
      chrome.contextMenus.create({
        id: 'manager-old',
        contexts: ['browser_action'],
        title: 'use old interface',
        type: 'radio',
        checked: prefs.interface === 'manager-old'
      });
    });
  };
  chrome.runtime.onStartup.addListener(start);
  chrome.runtime.onInstalled.addListener(start);
}
chrome.contextMenus.onClicked.addListener(info => chrome.storage.local.set({
  interface: info.menuItemId
}));

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install'
            });
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
