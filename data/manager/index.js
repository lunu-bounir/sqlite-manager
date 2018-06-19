/* global api */
'use strict';

api.notify.clean();

api.box.add();

api.on('db.file', async(file, name = 'unknown db') => {
  try {
    const {init, open} = api.sql;
    await init();
    const id = await open(file);
    api.tools.add(file ? file.name : name, id);
  }
  catch (e) {
    console.error(e);
  }
});

var print = (msg, div, type = 'note') => {
  div.textContent = msg;
  div.dataset.type = type;
};

api.on('execute.sql', async({cmd, result}) => {
  if (cmd) {
    const [sql, pipe] = cmd.split(/\s*\|\s*/);

    const id = api.tools.id();
    try {
      const r = api.sql.exec(id, sql);
      if (pipe) {
        if (pipe.startsWith('import as ')) {
          await api.compute.init();
          const name = pipe.replace(/import as\s+/, '');
          print(api.compute.import(name, r), result);
        }
        else {
          print('Unknown pipe', result, 'error');
        }
      }
      else {
        r.forEach(o => api.box.table(o, result));
        if (r.length === 0) {
          print('no output', result, 'warning');
        }
      }
    }
    catch (e) {
      print(e.message, result, 'error');
    }
  }
  else {
    print('Empty command', result, 'warning');
  }
});

api.on('execute.math', async({cmd, result}) => {
  try {
    await api.compute.init();
    const r = await api.compute.exec(cmd);
    if (r.type === 'plot') {
      await api.chart.init();
      api.chart.plot(r.x, r.y, result);
    }
    else {
      print(r, result);
    }
  }
  catch (e) {
    console.log(e);
    print(e.message, result, 'error');
  }
});
