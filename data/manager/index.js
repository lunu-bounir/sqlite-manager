/* global api */
'use strict';

api.notify.clean();

api.box.add();

api.on('db.file', async (file, name = 'unknown db') => {
  try {
    const id = await api.sql.open(file);
    api.tools.add(file && file.name ? file.name : name, id);
  }
  catch (e) {
    console.error(e);
  }
});
api.on('csv.file', file => {
  const reader = new FileReader();
  reader.onload = async () => {
    const [columns, ...values] = api.format.csv.toArray(reader.result);
    // find the table name
    let table = 'my_table';
    try {
      const r = await api.sql.exec(api.tools.id(), 'SELECT name FROM sqlite_master WHERE type IN ("table","view") AND name NOT LIKE "sqlite_%" ORDER BY 1');
      table = r[0].values[0];
    }
    catch (e) {}
    let statement = 'INSERT OR REPLACE INTO ' + table + ' ';
    statement += `(${api.format.sql.toColumns(columns)}) VALUES \n  `;
    statement += values.map(vs => `(${api.format.sql.toValues(vs)})`).join(',\n  ') + ';';
    const input = api.box.last();
    input.value = statement;
    input.dispatchEvent(new Event('input'));
    input.focus();
  };

  reader.readAsText(file, 'utf-8');
});

var print = (msg, div, type = 'note') => {
  const pre = document.createElement('pre');
  pre.textContent = msg;
  pre.dataset.type = type;
  div.appendChild(pre);
};

api.on('execute.sql', async ({query, parameters, result, target}) => {
  if (query) {
    const pipes = [];
    // extract all pipes
    query = query.split(';').filter(q => q).map(query => query.trim()).map((query, i) => {
      const [sql, pipe] = query.split(/\s* \| import as \s*/);
      if (pipe) {
        pipes[i] = pipe;
      }
      return sql;
    }).join('; ');

    const id = api.tools.id();
    if (isNaN(id)) {
      print('Load a SQLite database or create a new one before executing SQLite commands', result, 'error');
    }
    else {
      result.dataset.mode = 'busy';
      await api.sql.parse.init();
      try {
        const ast = query.length < 1000 ? api.sql.parse.exec(query) : {};
        result.ast = ast;

        const r = (typeof parameters !== 'undefined' ?
          (await api.sql.pexec(id, query, parameters)) :
          (await api.sql.exec(id, query))
        ) || [];
        r.forEach(async (o, i) => {
          if (pipes[i]) {
            await api.compute.init();
            print(api.compute.import(pipes[i], o), result, 'sql');
          }
          else {
            api.box.table(i, query, o, result);
          }
        });
        if (r.length === 0) {
          print('no output', result, 'warning');
        }
        delete result.dataset.mode;
      }
      catch (e) {
        print(e.message, result, 'error');
        delete result.dataset.mode;
      }
      target.scrollIntoView({
        block: 'start',
        inline: 'nearest'
      });
    }
  }
  else {
    print('Empty command', result, 'warning');
  }
});

api.on('execute.math', async ({query, result, index, target}) => {
  try {
    await api.compute.init();
    let r = await api.compute.exec(query, result, index, target);
    r = r.entries ? r : {
      entries: [r]
    };
    const plts = r.entries.filter(o => o && o.type === 'plot');
    if (plts.length) {
      await api.chart.init();
      api.chart.plot(plts, result);
    }
    const rlts = r.entries.filter(o => !o || o.type !== 'plot');
    for (const rlt of rlts) {
      if (rlt) {
        print(rlt, result);
      }
      else {
        print('no output', result, 'warning');
      }
    }
  }
  catch (e) {
    console.error(e);
    print(e.message, result, 'error');
  }
});
