/* globals api */
const box = {
  active: null,
  selected: [],
  boxes: []
};

const root = document.getElementById('box');
root.addEventListener('click', e => {
  if (e.target.tagName === 'TD' && window.getSelection().toString() === '') {
    const tr = e.target.closest('tr');
    tr.dataset.selected = tr.dataset.selected !== 'true';
  }
});
const viewer = document.getElementById('viewer');
viewer.addEventListener('click', ({target}) => {
  const x = viewer.scrollLeft;
  const y = viewer.scrollTop;
  if (target === viewer) {
    box.active.focus();
    viewer.scrollTo(x, y);
  }
  else {
    const div = target.closest('[data-id="command-box"]');
    if (div && window.getSelection().toString() === '') {
      div.querySelector('textarea').focus();
      viewer.scrollTo(x, y);
      // when editor disappears by clicking outside of the editor area;
      window.setTimeout(() => viewer.scrollTo(x, y));
    }
  }
});

const keys = [
  'ABORT', 'ACTION', 'ADD', 'AFTER', 'ALL', 'ALTER', 'ANALYZE',
  'AND', 'AS', 'ASC', 'ATTACH', 'AUTOINCREMENT', 'BEFORE', 'BEGIN',
  'BETWEEN', 'BY', 'CASCADE', 'CASE', 'CAST', 'CHECK', 'COLLATE', 'COLUMN',
  'COMMIT', 'CONFLICT', 'CONSTRAINT', 'CREATE', 'CROSS', 'CURRENT_DATE',
  'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'DATABASE', 'DEFAULT', 'DEFERRABLE',
  'DEFERRED', 'DELETE', 'DESC', 'DETACH', 'DISTINCT', 'DROP', 'EACH', 'ELSE',
  'END', 'ESCAPE', 'EXCEPT', 'EXCLUSIVE', 'EXISTS', 'EXPLAIN', 'FAIL', 'FOR',
  'FOREIGN', 'FROM', 'FULL', 'GLOB', 'GROUP', 'HAVING', 'IF', 'IGNORE',
  'IMMEDIATE', 'IN', 'INDEX', 'INDEXED', 'INITIALLY', 'INNER', 'INSERT',
  'INSTEAD', 'INTERSECT', 'INTO', 'IS', 'ISNULL', 'JOIN', 'KEY', 'LEFT',
  'LIKE', 'LIMIT', 'MATCH', 'NATURAL', 'NO', 'NOT', 'NOTNULL', 'NULL', 'OF',
  'OFFSET', 'ON', 'OR', 'ORDER', 'OUTER', 'PLAN', 'PRAGMA', 'PRIMARY', 'QUERY',
  'RAISE', 'RECURSIVE', 'REFERENCES', 'REGEXP', 'REINDEX', 'RELEASE', 'RENAME',
  'REPLACE', 'RESTRICT', 'RIGHT', 'ROLLBACK', 'ROW', 'SAVEPOINT', 'SELECT', 'SET',
  'TABLE', 'TEMP', 'TEMPORARY', 'THEN', 'TO', 'TRANSACTION', 'TRIGGER', 'UNION',
  'UNIQUE', 'UPDATE', 'USING', 'VACUUM', 'VALUES', 'VIEW', 'VIRTUAL', 'WHEN',
  'WHERE', 'WITH', 'WITHOUT'
];
const isSQL = cmd => {
  return keys.indexOf(cmd.trim().split(' ')[0].toUpperCase()) !== -1;
};

box.add = () => {
  const t = document.getElementById('command-box');
  const clone = document.importNode(t.content, true);
  const div = clone.querySelector('[data-id="command-box"]');
  const index = box.boxes.push(div);
  div.index = index - 1;
  div.dataset.index = '#' + index;
  const result = clone.querySelector('[data-id=result]');
  const input = clone.querySelector('textarea');
  if (index === 1) {
    input.placeholder = `Welcome to SQLite Manager

Use the "File" menu to open or create a new SQLite database or simply drop a database into this window. You can work on several databases. To select the active database use the selector tool.

You can run one or more SQLite or Math.js commands in each computational box. To execute the command press the "Enter" key. To move to the next line without executing the command use "Shift" + "Enter" key combination.

-> Use help("command name") to get more info about each Math.js command (e.g.: help("selected")). This function is not usable for SQLite commands at the moment.

-> Supported commands: This extension supports most of the SQLite CLI commands and  all of the Math.js commands

-> Extra commands:
    plot: plot one or more arrays. See the Chart.js menu for examples
    selected: export selected row from the previous SQLite table to the Math.js sandbox
    results: export a row from the previous SQLite table to the Math.js sandbox
    db_new: Create a new database on the browser memory
    db_load: Load a database from a server
    db_download: Download the active database to the browser's default download directory
    db_remove: Remove the active database from the browser memory`;
  }
  input.style.height = '380px';

  // RESIZE
  const resize = () => {
    const scrollTop = viewer.scrollTop;
    input.style.height = '20px';
    input.style.height = input.scrollHeight + 'px';
    input.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
    // keep the scroll top position; test with very long content
    viewer.scrollTop = scrollTop;
  };
  input.addEventListener('keyup', resize);
  input.addEventListener('input', resize);
  input.addEventListener('paste', resize);
  input.addEventListener('keydown', e => {
    const {target, key} = e;
    // switch to next or previous boxes
    if (target.selectionStart === target.selectionEnd && ['ArrowUp', 'ArrowDown'].indexOf(key) !== -1) {
      // switch to the previous box
      if (key === 'ArrowUp' && target.selectionStart === 0) {
        const p = div.previousElementSibling;
        if (p && p.dataset.id === 'command-box') {
          p.querySelector('textarea').focus();
        }
      }
      // switch to the next box
      else if (key === 'ArrowDown' && target.selectionStart === target.value.length) {
        const p = div.nextElementSibling;
        if (p && p.dataset.id === 'command-box') {
          p.querySelector('textarea').focus();
        }
      }
    }
  });
  input.addEventListener('keypress', e => {
    // dealing with Enter
    if (e.key === 'Enter' && e.shiftKey === false && input.value.trim()) {
      e.preventDefault();
      const next = div.nextElementSibling;
      if (next) {
        next.querySelector('textarea').focus();
      }
      else {
        box.add();
      }
      result.textContent = '';
      delete result.dataset.type;

      const index = e.target.closest('[data-id="command-box"]').index;

      api.emit(isSQL(input.value) ? 'execute.sql' : 'execute.math', {
        query: input.value,
        result,
        target: e.target,
        index
      });
    }
  });
  input.addEventListener('focus', e => box.active = e.target);
  root.appendChild(clone);
  input.focus();
  resize();
  window.setTimeout(() => result.scrollIntoView());
  box.active = input;
};

box.table = (index, sql, {columns, values}, parent) => {
  if (values.length === 0) {
    const pre = document.createElement('pre');
    pre.textContent = 'Empty Result';
    pre.dataset.type = 'warning';
    return parent.appendChild(pre);
  }
  const table = document.createElement('table');
  table.sql = sql;
  table.columns = columns;
  table.index = index;
  const thead = document.createElement('thead');
  {
    const tr = document.createElement('tr');
    ['#', ...columns].forEach(name => {
      const th = document.createElement('th');
      th.textContent = name;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
  }
  const tbody = document.createElement('tbody');
  table.appendChild(thead);
  table.appendChild(tbody);
  parent.appendChild(table);

  const fragment = document.createDocumentFragment();
  const add = (row, i) => {
    if (row) {
      const tr = document.createElement('tr');
      tr.index = i;
      [i + 1, ...row].forEach((name, i) => {
        const td = document.createElement('td');
        td.index = i;
        td.value = td.textContent = name;
        tr.appendChild(td);
      });
      fragment.appendChild(tr);
    }
  };
  if (values.length > 500) {
    const msg = `Printing a large table in the view could make your browser unresponsive for several minutes. Consider appending "LIMIT 100" to your SQL command to prevent a large data being returned.

Press "Cancel" to abort the command execution.`;
    if (confirm(msg)) {
      values.forEach(add);
    }
    else {
      table.textContent = 'aborted';
    }
  }
  else {
    values.forEach(add);
  }
  tbody.appendChild(fragment);

  const tools = new api.Table(table, columns, values);
  tools.add();
};

box.clean = () => {
  [...root.querySelectorAll('[data-id=command-box]')].slice(0, -1)
    .forEach(e => e.remove());
  box.active = root.querySelector('[data-id=command-box] textarea');
};

box.last = () => {
  return document.querySelector('[data-id=command-box]:last-child textarea');
};

box.get = index => {
  return box.boxes[index];
};

box.trs = index => {
  return [...box.boxes[index].querySelectorAll('tbody tr')];
};

box.selected = index => {
  const div = box.get(index);
  return [...div.querySelectorAll('[data-selected="true"]')];
};

export default box;
