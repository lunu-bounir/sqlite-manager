/* globals api */

import values from '../values.js';

const select = document.getElementById('dbs');
const tools = {};

tools.add = (name, id) => {
  const option = document.createElement('option');
  option.value = id;
  option.textContent = id + ' :: ' + name;
  option.selected = true;
  select.appendChild(option);
};

tools.remove = id => {
  select.querySelector(`[value="${id}"]`).remove();
};

tools.id = () => select.value ? Number(select.value) : NaN;
tools.name = () => {
  if (select.selectedOptions[0]) {
    return select.selectedOptions[0].textContent.split(' -> ')[1];
  }
  return 'unknown';
};

const mousedown = ({target}) => {
  let value = target.dataset.value;
  if (value && value.startsWith('values:')) {
    const id = value.replace('values:', '');
    value = values[id];
  }
  if (value) {
    const msg = value
      .replace('%id%', tools.id)
      .replace('%name%', tools.name) + '\n';

    const input = api.box.active;
    input.focus();
    if (document.execCommand('insertText', null, msg) === false) {
      input.value = msg;
      input.dispatchEvent(new Event('input'));
    }

    window.setTimeout(() => input.focus(), 0);
    // input.scrollTop = input.scrollHeight;
  }
  const cmd = target.dataset.cmd;
  if (cmd === 'close') {
    window.close();
  }
  else if (cmd === 'box.clean') {
    api.box.clean();
  }
  else if (cmd === 'history.clear') {
    api.history.clear();
  }
  else if (cmd === 'sql.export') {
    api.sql.export(tools.id(), tools.name()).catch(e => alert('Did you have an open database?\n\n--\n' + e));
  }
  else if (cmd === 'api.emit -> db.file') {
    api.emit('db.file', undefined, 'my_database.sqlite');
  }
  else if (cmd === 'query.file -> click') {
    document.querySelector('input[type=file]').click();
  }
  else if (cmd === 'faqs') {
    chrome.tabs.create({
      url: chrome.runtime.getManifest().homepage_url
    });
  }
  else if (cmd === 'open.js.editor') {
    window.setTimeout(() => api.Table.editor.open({
      top: 10,
      left: 10
    }, 'js', `Run JavaScript commands in a sandboxed window. To access the MathJS scope, use the 'mathjs' global variable. This way you can use MathJS variables in the JS environment. To export a variable to the MathJS scope, use send('variable-name', 'variable-value') command. To see the outputs, use your browser console.`));
  }
  else if (cmd === 'sqlite -> help') {
    chrome.tabs.create({
      url: 'https://www.sqlite.org/docsrc/doc/trunk/art/syntax/all-bnf.html'
    });
  }
  else if (cmd === 'math.js -> help') {
    chrome.tabs.create({
      url: 'http://mathjs.org/docs/reference/functions.html'
    });
  }
  else if (cmd === 'fullscreen') {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    else {
      document.body.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  }
};
document.querySelector('#tools [data-id=commands]').addEventListener('mousedown', mousedown);
document.querySelector('#tools [data-id=commands]').addEventListener('touchend', mousedown);

export default tools;
