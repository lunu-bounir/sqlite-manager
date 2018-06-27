/* api */
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

tools.id = () => Number(select.value);
tools.name = () => select.selectedOptions[0].textContent.split(' -> ')[1];

document.querySelector('#tools [data-id=commands]').addEventListener('click', ({target}) => {
  const value = target.dataset.value;
  if (value) {
    const msg = value
      .replace('%id%', tools.id)
      .replace('%name%', tools.name)
      .replace('%rand%', Math.random().toString(36).substring(7) + '.sqlite')
    api.box.active.focus();
    if (document.execCommand('insertText', null, msg) === false) {
      box.active.value = msg;
    };
  }
});

export default tools;
