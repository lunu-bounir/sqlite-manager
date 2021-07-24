{
  const prefs = {
    historyArray: [],
    historyLength: 200
  };
  const container = document.getElementById('history-container');
  const select = container.querySelector('select');

  const hide = () => {
    container.classList.add('hidden');
    if (window.box) {
      window.box.focus();
    }
  };

  chrome.storage.local.get(prefs, ps => {
    Object.assign(prefs, ps);
    for (const statement of prefs.historyArray.reverse()) {
      const option = document.createElement('option');
      option.value = statement;
      option.textContent = (statement || '').replace(/\n/g, '↵');
      select.appendChild(option);
    }
    select.options[0].selected = true;
    document.getElementById('history').disabled = prefs.historyArray.length === 0;
  });
  container.addEventListener('click', e => {
    if (e.target === container) {
      hide();
    }
  });
  document.getElementById('history').addEventListener('click', () => {
    container.classList.remove('hidden');
    select.focus();
  });

  const copy = () => {
    if (window.box) {
      window.box.question = select.value;
      hide();
    }
    else {
      navigator.clipboard.writeText(select.value).then(() => window.notify('copied to the clipboard')).finally(() => {
        hide();
      });
    }
  };

  document.addEventListener('keydown', e => {
    const meta = (e.metaKey || e.ctrlKey) && e.shiftKey;
    if (e.code === 'KeyH' && meta) {
      e.preventDefault();
      document.getElementById('history').click();
    }
    else if (e.code === 'Escape' && container.classList.contains('hidden') === false) {
      hide();
    }
    else if (e.code === 'Enter' && container.classList.contains('hidden') === false) {
      copy();
    }
  });
  select.addEventListener('dblclick', e => {
    if (e.target.tagName === 'OPTION') {
      copy();
    }
  });
  document.addEventListener('sql-success', e => {
    const statement = e.target.question.trim();
    if (statement) {
      const n = prefs.historyArray.indexOf(statement);
      if (n !== -1) {
        prefs.historyArray.splice(n, 1);
        for (const o of select.options) {
          if (o.value === statement) {
            o.remove();
          }
        }
      }
      prefs.historyArray.push(statement);
      const option = document.createElement('option');
      option.value = statement;
      option.textContent = (statement || '').replace(/\n/g, '↵');
      option.selected = true;
      select.insertBefore(option, select.firstElementChild);
      document.getElementById('history').disabled = false;
      chrome.storage.local.set({
        historyArray: prefs.historyArray.slice(-1 * prefs.historyLength)
      });
    }
  });
}
