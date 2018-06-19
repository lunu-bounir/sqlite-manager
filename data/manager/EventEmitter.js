'use strict';

/*
var a = new EventEmitter({
  'log-event': {
    first: () => console.log('we have at least one "log-event" listener. do whatever is needed'),
    last: () => console.log('all event listeners of type "log-event" are destroyed. do whatever is needed.')
  }
});

a.on('log-event', d => console.log('test with "ignore" condition', d)).ignore(d => d === 'ignore-me');
a.on('log-event', d => console.log('test with "if" condition' ,d)).if(d => d === 'ignore-me');
a.emit('log-event', 'this is a sample text');
a.emit('log-event', 'ignore-me');

 */
var EventEmitter = function(process = {}, obj) {
  Object.assign(this, {
    callbacks: {},
    ifs: {},
    ignores: {},
    onces: {},
    process
  }, obj);
};
EventEmitter.prototype.on = function(id, callback) {
  if (this.callbacks[id] === undefined || this.callbacks[id].length === 0) {
    // run constructor only once when there is at least one listener
    if (this.process[id] && this.process[id].first) {
      // console.log('first is called for', id);
      this.process[id].first();
    }
    this.callbacks[id] = [];
    this.ifs[id] = [];
    this.ignores[id] = [];
    this.onces[id] = [];
  }
  const index = this.callbacks[id].push(callback) - 1;
  this.ignores[id][index] = null;
  this.ifs[id][index] = null;
  return {
    get id() {
      return index;
    },
    ignore: fun => this.ignores[id][index] = fun,
    if: fun => this.ifs[id][index] = fun
  };
};
EventEmitter.prototype.once = function(id, callback) {
  const r = this.on(id, callback);
  this.onces[id][r.id] = true;
  return r;
};
EventEmitter.prototype.off = function(id, callback) {
  const index = (this.callbacks[id] || []).indexOf(callback);
  if (index !== -1) {
    this.callbacks[id].splice(index, 1);
    this.ignores[id].splice(index, 1);
    this.ifs[id].splice(index, 1);
    this.onces[id].splice(index, 1);
    // run deconstructor once there is no other listener
    if (this.callbacks[id].length === 0 && this.process[id] && this.process[id].last) {
      // console.log('last is called for', id);
      this.process[id].last();
    }
  }
};
EventEmitter.prototype.emit = function(id, ...data) {
  const offs = [];
  const rtns = (this.callbacks[id] || []).map((c, i) => {
    const run = () => {
      if (this.onces[id][i]) {
        offs.push(c);
      }
      return c(...data);
    };

    // ignore callback if it has ignore
    if (this.ignores[id][i]) {
      if (this.ignores[id][i](...data)) {
        return;
      }
    }
    if (this.ifs[id][i]) {
      if (this.ifs[id][i](...data)) {
        return run();
      }
    }
    else {
      return run();
    }
  });
  offs.forEach(c => this.off(id, c));

  return rtns;
};
