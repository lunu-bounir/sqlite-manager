/* globals api, sqliteParser */
const sql = {};
const worker = new Worker('api/worker.js');
let index = 0;

{
  const tmp = {};

  worker.onmessage = ({data}) => {
    if (data.error) {
      tmp[data.tId].reject(new Error(data.error));
    }
    else if (data.action === 'open') {
      tmp[data.tId].resolve();
    }
    else if (data.action === 'export') {
      const blob = new Blob([data.buffer], {type: 'application/x-sqlite3'});
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      tmp[data.tId].resolve();
    }
    else if (data.action === 'exec' || data.action === 'parametric-exec') {
      tmp[data.tId].resolve(data.results);
    }
  };
  worker.onerror = e => alert(e.message);

  const post = (id, data) => {
    const tId = Math.random();
    return new Promise((resolve, reject) => {
      tmp[tId] = {
        resolve,
        reject
      };

      worker.postMessage(Object.assign(data, {
        id,
        tId
      }));
    }).finally(() => {
      delete tmp[tId];
    });
  };
  // open from file
  const open = (file, id) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const bytes = new Uint8Array(r.result);
      post(id, {
        action: 'open',
        buffer: bytes
      }).then(resolve, reject);
    };
    r.readAsArrayBuffer(file);
  });
  // open from file or create an empty db
  const openc = (file, id) => {
    if (file) {
      return open(file, id);
    }
    return post(id, {
      id,
      action: 'open'
    });
  };
  // open and report
  sql.open = file => {
    const id = index;
    index += 1;

    return openc(file, id).then(() => {
      api.emit('db.ready');

      return id;
    });
  };

  sql.exec = (id = 0, sql) => post(id, {
    action: 'exec',
    sql
  });

  sql.pexec = (id = 0, sql, parameters) => post(id, {
    action: 'parametric-exec',
    sql,
    parameters
  });

  sql.close = (id = 0) => post(id, {
    action: 'close'
  });

  sql.export = (id = 0, filename = 'unknown_name.sqlite') => post(id, {
    action: 'export',
    filename
  });
}

sql.parse = {
  init: () => {
    if (typeof sqliteParser === 'undefined') {
      return api.require('vendor/sqlite-parser.js');
    }
    else {
      return Promise.resolve();
    }
  },
  exec: query => sqliteParser(query)
};

sql.run = async (query, parameters) => {
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
    throw Error('Load a SQLite database or create a new one before executing SQLite commands');
  }
  await sql.parse.init();

  const r = (typeof parameters !== 'undefined' ?
    (await sql.pexec(id, query, parameters)) :
    (await sql.exec(id, query))
  ) || [];

  if (pipes.length) {
    await api.compute.init();
  }
  return r.map((o, index) => {
    if (pipes[index]) {
      return api.compute.import(pipes[index], o);
    }
    else {
      return {
        type: 'table',
        index,
        sql,
        o,
        ast: query.length < 1000 ? api.sql.parse.exec(query) : {}
      };
    }
  });
};

export default sql;
