/* globals api */
'use strict';

const history = {};

{
  let historyArray = [];
  let historyLength = 30;
  const lis = [];
  const root = document.getElementById('history');


  const update = () => {
    for (let i = 0; i < historyLength; i += 1) {
      const li = lis[i];
      li.title = li.dataset.value = historyArray[i] || '';
      li.textContent = (historyArray[i] || '').replace(/\n/g, '↵');
    }
    root.closest('.list').dataset.disabled = historyArray.length === 0;
  };

  chrome.storage.local.get({
    historyArray,
    historyLength
  }, prefs => {
    historyArray = prefs.historyArray;
    historyLength = prefs.historyLength;


    const fragment = document.createDocumentFragment();
    for (let i = 0; i < historyLength; i += 1) {
      const li = document.createElement('li');
      lis.push(li);
      fragment.appendChild(li);
    }
    const sep = document.querySelector('#history .separator');
    root.insertBefore(fragment, sep);

    update();
    const append = ({query}) => {
      query = query.trim();
      historyArray.unshift(query);
      historyArray = historyArray.filter((s, i, l) => s && l.indexOf(s) === i);
      historyArray = historyArray.slice(0, historyLength);
      chrome.storage.local.set({
        historyArray
      });
      update();
    };
    api.on('execute.math', append);
    api.on('execute.sql', append);
  });

  history.clear = () => {
    historyArray = [];
    chrome.storage.local.set({
      historyArray
    });
    update();
  };
  history.update = update;
  history.get = index => historyArray[index] || 'empty';
}

export default history;
