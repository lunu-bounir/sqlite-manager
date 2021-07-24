/* globals api, math */
const box = {
  active: null,
  selected: [],
  boxes: []
};

// general editor shortcuts
box.keydown = e => {
  if (e.key === 'Enter' && e.shiftKey) {
    const v = e.target.value.substr(0, e.target.selectionStart).split('\n').pop();
    const s = v.match(/^(\s*)/)[0];
    if (s) {
      window.setTimeout(() => {
        document.execCommand('insertText', null, s);
      });
    }
  }
  else if (e.key === 'Tab') {
    e.preventDefault();
    document.execCommand('insertText', null, '  ');
  }
  else if (e.key === 'd' && e.metaKey) {
    if (e.target.selectionStart === e.target.selectionEnd) {
      const v = e.target.value.substr(0, e.target.selectionStart).split(/\s/).pop();
      if (v) {
        e.target.selectionStart -= v.length;
      }
    }
    e.preventDefault();
  }
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

Use the "File" menu to open or create a new SQLite database or simply drop a database into this window. You can work on several databases. To select the active database use the selector tool in the top right side of the screen.

You can run one or more SQLite or Math.js commands in each computational box. To execute the command press the "Enter" key. To move to the next line without executing the command use "Shift" + "Enter" key combination. Note that each computational box can either run SQLite or Math.js commands. You are not allowed to mix these two.

-> Use help("command name") to get more info about each Math.js command (e.g.: help("selected")). This function is not usable for SQLite commands at the moment.

-> Supported commands: This extension supports most of the SQLite CLI commands and  all of the Math.js commands

-> Extra commands:
    plot: plot one or more arrays. See the Chart.js menu for examples
    selected: export selected row from the previous SQLite table to the Math.js sandbox
    results: export a row from the previous SQLite table to the Math.js sandbox
    db_new: Create a new database on the browser memory
    db_load: Load a database from a server
    db_download: Download the active database to the browser's default download directory
    db_remove: Remove the active database from the browser memory
    js: Run JavaScript commands in a sandboxed window
    sql: Run SQLite commands in the Math.js environment`;
  }
  input.style.height = '380px';

  // RESIZE
  const resize = () => {
    const scrollTop = viewer.scrollTop;
    input.style.height = '30px';
    input.style.height = (input.scrollHeight + 10) + 'px';
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
    box.keydown(e);
  });
  input.addEventListener('focus', e => box.active = e.target);
  root.appendChild(clone);
  resize();
  window.setTimeout(() => input.focus());
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

box.print = (msg, div, type = 'note') => {
  const pre = document.createElement('pre');

  if (msg instanceof Error) {
    type = 'error';
    msg = msg.message;
  }

  if (msg && msg.type === 'mathjs') {
    if (msg.answer.type === 'js' || msg.answer.type === 'async') {
      msg = msg.answer;
    }
    else {
      msg = math.format(msg.answer);
    }
  }
  if (msg && msg.type === 'js') {
    const {code, name} = msg;
    msg = '...';
    api.sandbox.init().then(() => {
      api.sandbox.execute(code).then(r => {
        if (name) {
          api.compute.set(name, r);
        }
        if (typeof r === 'object') {
          r = JSON.stringify(r, null, '  ');
        }
        pre.textContent = r || 'empty output';
        if (!r) {
          pre.dataset.type = 'warning';
        }
      }).catch(e => {
        console.log(e);
        pre.textContent = e.message;
        pre.dataset.type = 'error';
      });
    });
  }
  else if (msg && msg.type === 'async') {
    const {command, parameters} = msg;
    msg = '...';
    api.sql.run(command, parameters).then(rs => {
      for (const r of rs) {
        box.print(r, div, type);
      }
      if (rs.length === 0) {
        box.print('', div);
      }
    }).catch(e => box.print(e, div)).finally(() => pre.remove());
  }
  if (msg && msg.type === 'table') {
    div.ast = msg.ast;
    return box.table(msg.index, msg.sql, msg.o, div);
  }

  if (!msg) {
    type = 'warning';
    msg = 'empty output';
  }
  pre.textContent = msg;

  pre.dataset.type = type;
  div.appendChild(pre);
};

export default box;
