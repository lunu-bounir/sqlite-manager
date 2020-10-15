'use strict';

window.addEventListener('message', e => {
  if (e.data.method === 'execute') {
    const o = Object.assign(e.data, {
      method: 'result'
    });
    window.mathjs = e.data.scope;
    try {
      o.result = eval(e.data.code);
    }
    catch (e) {
      o.error = e.message;
    }
    window.top.postMessage(o, '*');
  }
});

window.send = (name, value) => {
  window.top.postMessage({
    method: 'assign',
    name,
    value
  }, '*');
};
