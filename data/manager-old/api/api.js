/* globals EventEmitter */

import sql from './sql.js';
import chart from './chart.js';
import box from './box.js';
import compute from './compute.js';
import tools from './tools.js';
import history from './history.js';
import format from './format.js';
import './file.js';
import Table from './table.js';
import sandbox from './sandbox.js';

const api = new EventEmitter();
window.api = api;

{
  const e = document.getElementById('notify');
  let id;

  api.notify = (msg, timeout = 5) => {
    window.clearTimeout(id);
    id = window.setTimeout(() => e.dataset.hidden = true, timeout * 1000);
    e.dataset.hidden = false;
    e.querySelector('span:last-child').textContent = msg;
  };
  api.notify.clean = () => {
    window.clearTimeout(id);
    e.dataset.hidden = true;
  };
}

api.require = src => new Promise(resolve => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => {
    resolve();
    document.documentElement.removeChild(script);
  };
  script.onerror = () => alert(`cannot load "${src}"`);
  document.documentElement.appendChild(script);
});

api.sql = sql;
api.chart = chart;
api.box = box;
api.compute = compute;
api.tools = tools;
api.history = history;
api.format = format;
api.Table = Table;
api.sandbox = sandbox;

api.require('./index.js');
