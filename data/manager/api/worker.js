/* globals SQL */
'use strict';

self.importScripts('../vendor/sql.js');

var dbs = {};

self.onmessage = ({data}) => {
  try {
    if (data.action === 'open') {
      if (data.buffer) {
        dbs[data.id] = new SQL.Database(data.buffer);
        delete data.buffer;
      }
      else {
        dbs[data.id] = new SQL.Database();
      }
    }
    else if (data.action === 'close') {
      dbs[data.id].close();
    }
    else if (data.action === 'exec') {
      data.results = dbs[data.id].exec(data.sql);
      delete data.sql;
    }
    else if (data.action === 'export') {
      data.buffer = dbs[data.id].export();
    }
  }
  catch (e) {
    data.error = e.message;
  }

  self.postMessage(data);
};
