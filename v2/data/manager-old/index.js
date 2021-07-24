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

api.on('json.file', file => {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const json = JSON.parse(reader.result);
      api.compute.set('last', json);
      api.notify('"last" variable contains ' + file.name);
    }
    catch (e) {
      api.notify(e.message);
    }
  };

  reader.readAsText(file, 'utf-8');
});

api.on('execute.sql', async ({query, parameters, result, target}) => {
  const activeElement = api.box.active;
  if (query) {
    result.dataset.mode = 'busy';
    await api.sql.parse.init();
    try {
      const rs = await api.sql.run(query, parameters);
      for (const r of rs) {
        api.box.print(r, result);
      }
      if (rs.length === 0) {
        api.box.print('', result);
      }
      delete result.dataset.mode;
    }
    catch (e) {
      api.box.print(e, result);
      delete result.dataset.mode;
    }
  }
  else {
    api.box.print('Empty command', result, 'warning');
  }
  target.focus();
  activeElement.focus();
});

api.on('execute.math', async ({query, result, index, target}) => {
  const activeElement = api.box.active;
  try {
    await api.compute.init();
    let r = await api.compute.exec(query, result, index, target);
    r = r.entries && Array.isArray(r.entries) ? r : {
      entries: [r]
    };

    const plts = r.entries.filter(o => o && o.type === 'plot');
    if (plts.length) {
      await api.chart.init();
      api.chart.plot(plts, result);
    }
    const rlts = r.entries.filter(o => !o || o.type !== 'plot');
    for (const answer of rlts) {
      api.box.print({
        type: 'mathjs',
        answer
      }, result);
    }
  }
  catch (e) {
    console.error(e);
    api.box.print(e.message, result, 'error');
  }
  target.focus();
  activeElement.focus();
});

