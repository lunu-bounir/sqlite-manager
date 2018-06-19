/* globals api */
const box = {};

const root = document.getElementById('box');

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
  return keys.indexOf(cmd.split(' ')[0].toUpperCase()) !== -1;
};

box.add = () => {
  const t = document.getElementById('command-box');
  const clone = document.importNode(t.content, true);
  const result = clone.querySelector('[data-id=result]');
  const input = clone.querySelector('textarea');

  // RESIZE
  const resize = () => {
    input.style.height = '20px';
    input.style.height = input.scrollHeight + 'px';
  };
  input.addEventListener('keyup', resize);
  input.addEventListener('paste', resize);
  input.addEventListener('keydown', e => {
    const {target, key} = e;
    // switch to next or previous boxes
    if (target.selectionStart === target.selectionEnd && ['ArrowUp', 'ArrowDown'].indexOf(key) !== -1) {
      // switch to the previous box
      if (key === 'ArrowUp' && target.selectionStart === 0) {
        const p = target.closest('[data-id="command-box"]').previousElementSibling;
        if (p && p.dataset.id === 'command-box') {
          p.querySelector('textarea').focus();
        }
      }
      // switch to the next box
      else if (key === 'ArrowDown' && target.selectionStart === target.value.length) {
        const p = target.closest('[data-id="command-box"]').nextElementSibling;
        if (p && p.dataset.id === 'command-box') {
          p.querySelector('textarea').focus();
        }
      }
    }
  });
  input.addEventListener('keypress', e => {
    // dealing with Enter
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      const next = e.target.closest('[data-id="command-box"]').nextElementSibling;
      if (next) {
        next.querySelector('textarea').focus();
      }
      else {
        box.add();
      }
      result.textContent = '';
      delete result.dataset.type;

      api.emit(isSQL(input.value) ? 'execute.sql' : 'execute.math', {
        cmd: input.value,
        result
      });
    }
  });
  root.appendChild(clone);
  input.focus();
  window.setTimeout(() => result.scrollIntoView());
};

box.table = ({columns, values}, parent) => {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  {
    const tr = document.createElement('tr');
    columns.forEach(name => {
      const th = document.createElement('th');
      th.textContent = name;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
  }
  const tbody = document.createElement('tbody');
  values.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(name => {
      const td = document.createElement('td');
      td.textContent = name;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  parent.appendChild(table);
};

export default box;
