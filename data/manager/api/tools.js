/* globals api */
const select = document.getElementById('dbs');
const tools = {};

tools.add = (name, id) => {
  const option = document.createElement('option');
  option.value = id;
  option.textContent = id + ' -> ' + name;
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

document.querySelector('#tools [data-id=commands]').addEventListener('mousedown', ({target}) => {
  const value = target.dataset.value;
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
});

export default tools;
