/* global importScripts, initSqlJs */

importScripts('./sqljs-wasm/sql.js');

let SQL;
let db;

onmessage = async ({data}) => {
  if (data.method === 'open-new' || data.method === 'open-binary') {
    SQL = SQL || await initSqlJs({
      locateFile: n => './sqljs-wasm/' + n
    });
    if (data.method === 'open-new') {
      db = new SQL.Database();
    }
    else {
      db = new SQL.Database(data.value);
    }
    postMessage({
      method: 'result',
      id: data.id
    });
  }
  else if (data.method === 'execute') {
    try {
      postMessage({
        method: 'result',
        id: data.id,
        value: db.exec(data.statement, data.params)
      });
    }
    catch (e) {
      postMessage({
        method: 'error',
        id: data.id,
        message: e.message
      });
    }
  }
  else if (data.method === 'export') {
    postMessage({
      method: 'result',
      id: data.id,
      value: db.export()
    });
  }
};
