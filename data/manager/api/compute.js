/* globals api, math */
const compute = {};

const scope = {};

compute.init = () => {
  if (typeof math === 'undefined') {
    return api.require('venders/math.min.js').then(() => {
      math.import({
        plot: (ax, ay) => {
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
        'db_new': name => {
          api.emit('db.file', undefined, name);

          return 'Creating a new SQLite database';
        },
        'db_remove': id => {
          api.sql.close(id);
          api.tools.remove(id);

          return 'Removing an existing SQLite database';
        },
        'db_download': id => {
          api.sql.export(id, api.tools.name());

          return 'Downloading the database to the default download directory';
        }
      }, scope);
      api.emit('math.init');
    });
  }
  return Promise.resolve();
};

compute.import = (name, aa) => compute.exec(`${name.trim()} = squeeze(${JSON.stringify(
  aa.map(a => a.values)
)})`);

compute.exec = exp => {
  const r = math.eval(exp, scope);
  return r.type ? r : math.format(r);
};

export default compute;
