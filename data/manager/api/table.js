/* globals api */
const editor = document.getElementById('editor');
editor.input = editor.querySelector('textarea');
editor.close = (e, stop = true) => {
  editor.dataset.visible = false;
  try {
    editor.tr.dataset.editor = false;
  }
  catch (e) {}
  if (stop) {
    e.stopPropagation();
  }
};
editor.addEventListener('click', e => {
  const cmd = e.target.dataset.cmd;
  if (cmd === 'close') {
    editor.close(e);
  }
  else if (cmd === 'execute') {
    const id = api.tools.id();
    const query = editor.input.value;
    const error = e => {
      window.alert('Cannot retrieve the new value from the database. Update manually to get the new value\n\n' + e.message);
      editor.close(e);
    };
    api.sql.exec(id, query).then(() => {
      try {
        const ast = api.sql.parse.exec(query);
        const table = api.format.sql.toColumns([ast.statement[0].into.name]);
        const name = api.format.sql.toColumns([ast.statement[0].set[0].target.name]);
        const key = api.format.sql.toColumns([ast.statement[0].where[0].left.name]);
        const value = api.format.sql.toValues([ast.statement[0].where[0].right.name]);

        api.sql.exec(id, `SELECT ${name} FROM ${table} WHERE ${key} = ${value} limit 1`).then(r => {
          try {
            // in case the name has special chars
            const index = editor.columns.indexOf(ast.statement[0].set[0].target.name);
            if (index !== -1) {
              editor.tr.querySelectorAll('td')[index + 1].textContent = r[0].values[0];
            }
            else {
              throw Error(`Cannot find "${name}" column!`);
            }
            editor.close(e);
          }
          catch (e) {
            error(e);
          }
        }).catch(e => {
          error(e);
        });
      }
      catch (e) {
        error(e);
      }
    }).catch(error);
  }
});
// hide editor on click
document.addEventListener('click', e => {
  if (!e.target.closest('#editor')) {
    editor.close(e, false);
  }
});

const Table = function(root, columns, values) {
  this.root = root;
  this.columns = columns;
  this.values = values;

  root.addEventListener('click', e => {
    const td = e.target;
    if (td.tagName === 'TD' && e.detail === 2) {
      const tr = td.closest('tr');

      const rect = td.getBoundingClientRect();
      const offset = rect.left + 380 - document.documentElement.clientWidth;
      editor.style.left = rect.left + (offset > 0 ? -offset : 0) + 'px';
      editor.style.top = rect.top + 'px';
      editor.tr = tr;
      editor.columns = root.columns;
      try {
        const obj = this.parse(this.root.index, tr.index, td.index);

        let statement = 'UPDATE ';
        statement += api.format.sql.toColumns([obj.table]);
        statement += ' SET ';
        statement += api.format.sql.toColumns([obj.selected.name]);
        statement += ' = ';
        let start = statement.length;
        statement += api.format.sql.toValues([obj.selected.value]);
        let end = statement.length;
        if (statement.endsWith('"')) {
          start += 1;
          end -= 1;
        }
        statement += ' WHERE ';
        statement += api.format.sql.toColumns([obj.id.name]);
        statement += ' = ';
        statement += api.format.sql.toValues([obj.id.value]);

        window.setTimeout(() => {
          editor.input.value = statement;
          editor.input.selectionStart = start;
          editor.input.selectionEnd = end;
          editor.dataset.visible = true;
          editor.input.focus();
          editor.scrollIntoView();
          tr.dataset.editor = true;
          tr.dataset.selected = true;
        });
      }
      catch (e) {
        api.notify('Cannot edit this value: ' + e.message);
      }
    }
  });
};
Table.prototype.add = function() {
  const input = document.createElement('input');
  input.type = 'button';
  input.value = 'Export';
  input.onclick = () => {
    const content = api.format.csv.toString([this.columns, ...this.values]);
    const blob = new Blob([content], {type: 'text/csv'});
    const objectURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', objectURL);
    link.setAttribute('download', 'table.csv');
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent('click'));
    setTimeout(() => URL.revokeObjectURL(objectURL));
  };

  const th = this.root.querySelector('th');
  th.textContent = '';
  th.appendChild(input);
};
Table.prototype.parse = function(qIndex, row, column) {
  // find id
  let i = 0;
  for (let j = 0; j < this.columns.length; j += 1) {
    if (name === 'id' || name === 'rowid') {
      i = j;
      break;
    }
  }
  const ast = this.root.closest('[data-id="result"]').ast;

  return {
    table: ast.statement[qIndex].from.name,
    selected: {
      name: this.columns[column - 1],
      value: this.values[row][column - 1]
    },
    id: {
      name: this.columns[i],
      value: this.values[row][i]
    }
  };
};

export default Table;
