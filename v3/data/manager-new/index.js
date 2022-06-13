window.config = {
  'run-inspector': true
};

window.active = () => {
  return document.getElementById('active').selectedOptions[0];
};
window.notify = msg => {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/data/icons/48.png',
    title: chrome.runtime.getManifest().name,
    message: msg
  });
};

// statements = ['query', 'query $[n][m][y][x]', {query: 'query'}]
window.compute = (statements, box, option, runs = []) => {
  if (Array.isArray(statements) === false) {
    statements = [statements];
  }
  let statement = statements.shift() || '';
  let params = [];
  if (typeof statement === 'object') {
    params = statement.params || [];
    statement = statement.query;
  }
  // replace placeholders
  statement = statement.replace(/\$\[(\d+)\]\[(\d+)\]\[(\d+)\]\[(\d+)\]/g, (d, n, m, y, x) => {
    try {
      return runs[n].answer[m].values[y][x];
    }
    catch (e) {
      return 'NA';
    }
  });

  if (statement === undefined) {
    return;
  }

  if (box === undefined) {
    const boxes = document.getElementById('boxes');
    box = document.createElement('box-view');
    // move between editors
    box.addEventListener('hit-start', () => {
      const e = box.previousElementSibling;
      if (e) {
        e.focus();
      }
    });
    box.addEventListener('hit-end', () => {
      const e = box.nextElementSibling;
      if (e) {
        e.focus();
      }
    });
    box.addEventListener('focus', () => {
      window.box = box;
    });
    box.addEventListener('close', () => {
      const e = (box.previousElementSibling || box.nextElementSibling);
      if (e) {
        e.focus();
      }
    });
    option = option || window.active();
    box.origin(option.number);
    option = null;
    box.addEventListener('submit', () => {
      if (box.question.trim()) {
        option = option || window.active();
        box.origin(option.number);
        const file = option.file;
        option = null;
        const sql = file.sql;
        sql.execute(box.question, box.params).then(a => {
          box.answer = a;
          runs.push({
            statement,
            params,
            answer: a
          });
          box.dispatchEvent(new Event('sql-success', {
            bubbles: true
          }));
          if (statements.length) {
            window.compute(statements, undefined, option, runs);
          }
        }).catch(e => box.error = e.message);
      }
    });
    boxes.appendChild(box);
    boxes.scrollTop = boxes.scrollHeight;
    box.focus();
  }
  window.compute.number += 1;
  box.badge(window.compute.number);
  if (statement) {
    box.answer = 'Wait...';
    box.params = params;
    box.question = statement;
  }
};
window.compute.number = 0;

document.addEventListener('keydown', e => {
  const meta = (e.metaKey || e.ctrlKey) && e.shiftKey;
  if (e.code === 'KeyC' && meta) {
    e.preventDefault();
    document.getElementById('clear').click();
  }
});
document.getElementById('clear').addEventListener('click', () => {
  const boxes = document.getElementById('boxes');
  boxes.textContent = '';
  window.compute.number = 0;
});
