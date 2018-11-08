/* globals api, math */
const compute = {};

const scope = {};

compute.init = () => {
  if (typeof math === 'undefined') {
    return api.require('vendor/math.min.js').then(() => {
      math.import({
        'plot': (ax, ay) => {
          if (ax) {
            ax = math.squeeze(ax);
          }
          if (ay) {
            ay = math.squeeze(ay);
          }
          if (ax && !ay) {
            ay = ax;
            ax = math.eval(`0:${ay._data.length - 1}`);
          }
          return {
            type: 'plot',
            x: ax._data,
            y: ay._data
          };
        },
        'history': i => api.history.get(i),
        'db_new': name => {
          api.emit('db.file', undefined, name);

          return 'a new SQLite database is created';
        },
        'db_remove': id => {
          api.sql.close(id);
          api.tools.remove(id);

          return 'an existing SQLite database is removed from your browser memory';
        },
        'db_download': id => {
          api.sql.export(id, api.tools.name());

          return 'the database is being downloaded to the default download directory of your browser';
        }
      }, scope);
      api.emit('math.init');
    });
  }
  return Promise.resolve();
};

compute.import = (name, aa) => compute.exec(`${name.trim()} = squeeze(${JSON.stringify(
  aa.values
)})`);

compute.exec = exp => {
  const r = math.eval(exp, scope);
  return r.type ? r : math.format(r);
};

export default compute;
