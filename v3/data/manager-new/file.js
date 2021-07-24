let number = 0;

const csvToArray = text => {
  let p = '';
  let row = [''];
  const ret = [row];
  let i = 0;
  let r = 0;
  let s = !0;
  let l;
  for (l of text) {
    if ('"' === l) {
      if (s && l === p) {
        row[i] += l;
      }
      s = !s;
    }
    else if (',' === l && s) {
      l = row[++i] = '';
    }
    else if ('\n' === l && s) {
      if ('\r' === p) {
        row[i] = row[i].slice(0, -1);
      }
      row = ret[++r] = [l = '']; i = 0;
    }
    else row[i] += l;
    p = l;
  }
  return ret;
};


const callbacks = {
  open: [fs => {
    for (const file of fs) {
      const option = document.createElement('option');
      option.file = file;
      file.option = option;
      option.textContent = (++number) + ' :: ' + file.name;
      option.number = number;
      option.selected = true;
      document.getElementById('active').appendChild(option);
      callbacks.activate.forEach(c => c(file));
    }
    document.getElementById('save').disabled = false;
    document.getElementById('add').disabled = false;
  }],
  activate: [file => {
    document.title = file.name + ' :: SQLite Manager';
  }],
  csv: [fs => {
    const option = window.active();

    if (option && option.disabled === false) {
      for (const file of fs) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const data = csvToArray(reader.result).filter(a => a.some(s => s));
            console.log(data);
            const statement = window.prompt('SQLite import statement:', 'INSERT INTO MyTable (column1, column2) VALUES(?, ?)');
            if (statement) {
              for (const params of data) {
                console.log(statement, params);
                await option.file.sql.execute(statement, params);
              }
              window.notify(data.length + ' records are imported to the active database');
            }
          }
          catch (e) {
            console.error(e);
            window.notify('Importing Error: ' + e.message);
          }
        };
        reader.readAsText(file, 'UTF-8');
      }
    }
    else {
      window.notify('no active database to import CSV records');
    }
  }]
};
window.file = {
  on: {
    open(c) {
      callbacks.open.push(c);
    },
    activate(c) {
      callbacks.activate.push(c);
    }
  }
};
document.getElementById('active').addEventListener('change', e => {
  callbacks.activate.forEach(c => c(e.target.selectedOptions[0].file));
});

const process = files => {
  const csvs = files.filter(f => f.type.startsWith('text/csv'));
  const dbs = files.filter(f => f.type.startsWith('text/csv') === false);

  if (csvs.length) {
    callbacks.csv.forEach(c => c(csvs));
  }
  if (dbs.length) {
    callbacks.open.forEach(c => c(dbs));
  }
};

document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {
  e.preventDefault();

  process([...e.dataTransfer.files]);
});
document.getElementById('file').addEventListener('click', () => {
  const input = document.createElement('input');
  input.multiple = true;
  input.type = 'file';
  input.onchange = () => {
    process([...input.files]);
  };
  input.click();
});
document.getElementById('link').addEventListener('click', () => {
  const href = prompt('Remote Link', 'https://');
  if (href) {
    callbacks.open.forEach(c => c([{
      name: href.split('/').pop() || 'unknown.db',
      href
    }]));
  }
});
document.getElementById('new').addEventListener('click', () => {
  callbacks.open.forEach(c => c([{
    name: 'memory.db'
  }]));
});
document.getElementById('sample').addEventListener('click', () => {
  callbacks.open.forEach(c => c([{
    name: 'sample.db',
    href: 'assets/chinook.db'
  }]));
});
document.getElementById('save').addEventListener('click', () => {
  const file = document.getElementById('active').selectedOptions[0].file;
  file.sql.export().then(ab => {
    const blob = new Blob([ab], {
      type: 'application/octet-stream'
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(href);
  });
});

document.addEventListener('keydown', e => {
  const meta = (e.metaKey || e.ctrlKey) && e.shiftKey;
  const stop = () => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };
  if (e.code === 'KeyA' && meta) {
    stop();
    document.getElementById('add').click();
  }
  else if (e.code === 'KeyO' && meta) {
    stop();
    document.getElementById('file').click();
  }
  else if (e.code === 'KeyL' && meta) {
    stop();
    document.getElementById('link').click();
  }
  else if (e.code === 'KeyE' && meta) {
    stop();
    document.getElementById('new').click();
  }
  else if (e.code === 'KeyS' && meta) {
    stop();
    document.getElementById('save').click();
  }
  else if (e.code.startsWith('Digit') && meta) {
    stop();
    const active = document.getElementById('active');
    const option = active.options[Number(e.key)];
    if (option) {
      option.selected = true;
      active.dispatchEvent(new Event('change'));
    }
  }
});
