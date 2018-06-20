/* globals api, SQL */
const sql = {};

sql.init = () => {
  if (typeof SQL === 'undefined') {
    return api.require('venders/sql.js').then(() => api.emit('sql.init'));
  }
  return Promise.resolve();
};

{
  const dbs = [];
  // open from file
  const open = (file, id) => new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => {
      const bytes = new Uint8Array(r.result);
      dbs[id] = new SQL.Database(bytes);

      resolve();
    };
    r.readAsArrayBuffer(file);
  });
  // open from file or create an empty db
  const openc = (file, id) => {
    if (file) {
      return open(file, id);
    }
    dbs[id] = new SQL.Database();
    return Promise.resolve();
  };
  // open and report
  sql.open = file => {
    const id = dbs.length;

    return openc(file, id).then(() => {
      api.emit('db.ready');

      return id;
    });
  };

  sql.exec = (id = 0, ...args) => {
    if (dbs[id]) {
      return dbs[id].exec(...args);
    }
    throw Error('Database is not found');
  };
  sql.each = (id = 0, ...args) => dbs[id].each(...args);

  sql.list = () => dbs;

  sql.close = (id = 0) => {
    dbs[id].close();
    dbs[id] = null;
  };

  sql.export = (id = 0, name = 'unknown name') => {
    const blob = new Blob([dbs[id].export()], {type: 'application/x-sqlite3'});
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = name;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl));
  };
}

export default sql;
