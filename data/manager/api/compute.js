/* globals api, math */
const compute = {};

const scope = {};

compute.init = () => {
  if (typeof math === 'undefined') {
    return api.require('vendor/math.min.js').then(() => {
      math.expression.docs.selected = {
        category: 'SQLite',
        description: 'Get a selected row from previously executed SQLite command. If there is no input argument, all the selected rows are returned',
        examples: [],
        name: 'selected',
        seealso: [],
        syntax: [
          'selected("index of the selected row in the previous command")'
        ]
      };
      math.expression.docs.results = {
        category: 'SQLite',
        description: 'Get a row from previously executed SQLite command. If there is no input argument, all the rows are returned',
        examples: [],
        name: 'results',
        seealso: [],
        syntax: [
          'results("index of the desired row in the previous command")'
        ]
      };
      math.expression.docs.db_new = {
        category: 'SQLite',
        description: 'Create a new SQLite database in memory',
        examples: [],
        name: 'db_new',
        seealso: [],
        syntax: [
          'db_new("name of the database")'
        ]
      };
      math.expression.docs.db_load = {
        category: 'SQLite',
        description: 'Fetch a database from a URL and open it',
        examples: [],
        name: 'db_load',
        seealso: [],
        syntax: [
          'db_load("http://...", "database name")'
        ]
      };
      math.expression.docs.db_download = {
        category: 'SQLite',
        description: 'Download a database from memory to local disk. The downloaded database will be placed in the default download directory of your browser',
        examples: [],
        name: 'db_download',
        seealso: [],
        syntax: [
          'db_download("index of the database")'
        ]
      };
      math.expression.docs.db_remove = {
        category: 'SQLite',
        description: 'Remove a database from memory',
        examples: [],
        name: 'db_remove',
        seealso: [],
        syntax: [
          'db_remove("index of the database")'
        ]
      };
      math.expression.docs.plot = {
        category: 'Plot',
        description: 'Plot one or more arrays. See the Chart.js menu for examples',
        examples: [],
        name: 'plot',
        seealso: [],
        syntax: [
          'plot(array)'
        ]
      };
      math.expression.docs.sql = {
        category: 'SQL',
        description: 'Run a single SQLite command from math.js environment. To execute this command multiple times with different inputs, provide an array of inputs as the second argument.',
        examples: [],
        name: 'sql',
        seealso: [],
        syntax: [
          'sql(\'SELECT * from table_name WHERE column=value\')',
          'sql(\'SELECT * from table_name WHERE column=:v\', {\':v\': \'test\'})',
          'sql(\'SELECT * from table_name WHERE column=:v\', [{\':v\': \'test-1\'}, {\':v\': \'test-2\'}])'
        ]
      };
      math.expression.docs.js = {
        category: 'JavaScript',
        description: 'Run JavaScript commands in a sandboxed environment. To access to the MathJS scope use "mathjs" global variable. To send JS objects to the MathJS environment, use send(name, value) method. To see the outputs of your command, open the browser console window',
        examples: [],
        name: 'js',
        seealso: [],
        syntax: [
          'js(\'alert(9)\')',
          'js(\'console.log(9)\')'
        ]
      };

      math.import({
        'js': (code, name) => ({
          type: 'js',
          code,
          name
        }),
        'sql': (command, parameters) => ({
          type: 'async',
          command,
          parameters
        }),
        'plot': (ax, ay, query) => {
          ax = math.squeeze(ax);
          if (typeof ay === 'string') {
            query = ay;
            ay = null;
          }

          if (ay) {
            ay = math.squeeze(ay);
          }
          if (ax && !ay) {
            ay = ax;
            ax = math.eval(`0:${ay._data ? ay._data.length - 1 : ay.length}`);
          }
          return {
            type: 'plot',
            x: ax._data || ax,
            y: ay._data || ay,
            query
          };
        },
        'history': i => api.history.get(i),
        'db_new': name => {
          api.emit('db.file', undefined, name);

          return 'A new SQLite database is created';
        },
        'db_remove': id => {
          api.sql.close(id);
          api.tools.remove(id);

          return 'An existing SQLite database is removed from your browser memory';
        },
        'db_download': id => {
          api.sql.export(id, api.tools.name());

          return 'The database is being downloaded to the default download directory of your browser';
        },
        'db_load': (path, name) => {
          chrome.permissions.request({
            origins: [path]
          }, granted => {
            // The callback argument will be true if the user granted the permissions.
            if (granted) {
              fetch(path).then(r => r.blob()).then(blob => {
                api.emit('db.file', blob, name);
                api.notify('Database is ready');
              }).catch(e => api.notify(e.message));
            }
          });

          return 'Please wait until database is loaded';
        },
        'selected': id => {
          const index = scope._index;
          if (index > 0) {
            const trs = api.box.selected(index - 1);
            if (trs && trs.length) {
              if (id && id >= 1) {
                if (trs[id - 1]) {
                  return [...trs[id - 1].querySelectorAll('td')].map(td => td.value);
                }
                else {
                  throw Error('There is no selected row with id = ' + id);
                }
              }
              else if (id !== undefined) {
                throw Error('First argument should be the number of the selected row in the previous SQLite calculation');
              }
              else {
                return trs.map(tr => [...tr.querySelectorAll('td')].map(td => td.value));
              }
            }
            else {
              throw Error('There is no selected rows in the previous command');
            }
          }
          else {
            throw Error('There is no previous box to get selection from. First run a SQLite command and then select a few rows and then use this command to import data');
          }
        },
        'results': id => {
          const index = scope._index;
          if (index > 0) {
            const div = api.box.get(index - 1);
            if (div) {
              const trs = api.box.trs(index - 1);
              if (trs) {
                if (id && id >= 1) {
                  if (trs[id - 1]) {
                    return [...trs[id - 1].querySelectorAll('td')].map(td => td.value);
                  }
                  else {
                    throw Error('There is no row with id = ' + id);
                  }
                }
                else if (id !== undefined) {
                  throw Error('First argument should be the number of the row in the previous SQLite calculation');
                }
                else {
                  return trs.map(tr => [...tr.querySelectorAll('td')].map(td => td.value));
                }
              }
              else {
                throw Error('There is no table to get results from. The previous command need to be a SQLite command that returns a table of results');
              }
            }
            else {
              throw Error('There is no computational box with id = ' + index);
            }
          }
          else {
            throw Error('There is no previous box to get results from. First run a SQLite command and then use this command to import data');
          }
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

compute.exec = (exp, result, index) => {
  scope._index = index;
  return math.eval(exp, scope);
};

compute.set = (name, val) => scope[name] = val;
Object.defineProperty(compute, 'scope', {
  get() {
    return scope;
  }
});

export default compute;
