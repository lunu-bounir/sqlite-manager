/* global config */
class SQL {
  constructor() {
    const worker = new Worker('engine/worker.js');
    worker.onmessage = e => this.message(e);
    this.cache = {};
    this.post = msg => {
      const id = Math.random();
      msg.id = id;

      return new Promise((resolve, reject) => {
        this.cache[id] = {resolve, reject};
        worker.postMessage(msg);
      });
    };
    this.close = () => worker.destroy();
  }
  open(file) {
    if (file.href) {
      return new Promise((resolve, reject) => {
        const next = () => fetch(file.href).then(r => r.arrayBuffer()).then(ab => {
          return this.post({
            method: 'open-binary',
            value: new Uint8Array(ab)
          });
        }).then(resolve, reject);

        try {
          chrome.permissions.request({
            origins: [file.href]
          }, () => {
            chrome.runtime.lastError;
            next();
          });
        }
        catch (e) {
          next();
        }
      });
    }
    else if (file.size) {
      return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
          this.post({
            method: 'open-binary',
            value: new Uint8Array(r.result)
          }).then(resolve, reject);
        };
        r.readAsArrayBuffer(file);
      });
    }
    return this.post({
      method: 'open-new'
    });
  }
  execute(statement, params) {
    return this.post({
      method: 'execute',
      statement,
      params
    });
  }
  export() {
    return this.post({
      method: 'export'
    });
  }
  message({data}) {
    if (data.method === 'result') {
      this.cache[data.id].resolve(data.value);
    }
    else if (data.method === 'error') {
      this.cache[data.id].reject(Error(data.message));
    }
  }
  post() {}
  close() {}
}

window.file.on.activate(file => {
  if (file.sql === undefined) {
    const sql = file.sql = new SQL();

    sql.open(file).then(() => {
      if (config['run-inspector']) {
        window.compute(
          [`SELECT name FROM sqlite_master
  WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY 1`, `SELECT * from "$[0][0][0][0]" LIMIT 10`],
          undefined,
          file.option
        );
      }
    }).catch(e => {
      console.error(e);
      window.notify(e.message);
    });
  }
});

document.getElementById('add').addEventListener('click', () => {
  window.compute('', undefined, window.active());
});
