/* globals api */
const sandbox = {};
let iframe;

sandbox.init = () => {
  if (typeof iframe === 'undefined') {
    return new Promise(resolve => {
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.onload = resolve;
      iframe.src = '/data/manager/sandbox.html';
      document.body.appendChild(iframe);
    });
  }
  return Promise.resolve();
};

const tmp = {};

window.addEventListener('message', e => {
  if (e.data.method === 'result') {
    const r = tmp[e.data.id];
    if (r) {
      if (e.data.error) {
        r.reject(Error(e.data.error));
      }
      else {
        r.resolve(e.data.result);
      }
    }
  }
  else if (e.data.method === 'assign') {
    api.compute.set(e.data.name, e.data.value);
  }
});

sandbox.execute = code => new Promise((resolve, reject) => {
  const tId = Math.random();
  tmp[tId] = {resolve, reject};
  iframe.contentWindow.postMessage({
    id: tId,
    method: 'execute',
    code,
    scope: api.compute.scope
  }, '*');
});
export default sandbox;
