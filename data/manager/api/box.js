/* globals api */
const box = {
  active: null
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
  const result = clone.querySelector('[data-id=result]');
  const input = clone.querySelector('textarea');

  // RESIZE
  const resize = () => {
    const scrollTop = viewer.scrollTop;
    input.style.height = '20px';
    input.style.height = input.scrollHeight + 'px';
    input.scrollIntoViewIfNeeded();
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

      api.emit(isSQL(input.value) ? 'execute.sql' : 'execute.math', {
        query: input.value,
        result
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

  const add = (row, i) => {
    if (row) {
      const tr = document.createElement('tr');
      tr.index = i;
      [i + 1, ...row].forEach((name, i) => {
        const td = document.createElement('td');
        td.index = i;
        td.textContent = name;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
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

// https://gist.githubusercontent.com/hsablonniere/2581101/raw/3634e38ed9393bf0ae987ce9318f11eefca12020/index.js
if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}

export default box;
