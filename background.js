'use strict';

chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({
  url: 'data/manager/index.html'
}));
