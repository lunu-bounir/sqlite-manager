import './editor-view/core.js';
import './chart-view/core.js';

class BoxView extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        .box {
          display: grid;
          grid-template-columns: 8px 1fr;
          grid-gap: 5px;
          padding: 5px;
          outline: none;
        }
        #margin {
          grid-row: 1/3;
          border: 1px solid #d3d3d3;
          border-right: none;
        }
        #editor {
          margin-top: 2px;
          position: relative;
          display: grid;
          grid-template-columns: min-content 1fr;
        }
        editor-view {
          background-color: var(--textarea-bg, #ffffe8);
        }
        .box:focus-within editor-view {
          background-color: var(--textarea-active-bg, #ffffd1);
        }
        #tools {
          position: absolute;
          bottom: 0;
          right: 0;
        }
        #tools button {
          border: none;
          outline: none;
          cursor: pointer;
          font-size: 10px;
          padding: 2px 5px;
        }
        .box:not(:focus-within) #tools button {
          display: none;
        }
        #count {
          position: absolute;
          top: 0;
          right: 0;
          color: var(--count, #eceff4);
          background-color: var(--count-bg, #5e81ac);
          padding: 1px 6px;
          font-size: 8px;
        }
        #db {
          padding: 10px;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }
        .hidden,
        #db:empty {
          display: none;
        }
        #answer {
          margin-bottom: 2px;
          overflow: hidden;
        }
        #answer[data-type=error] {
          color: var(--error, #ff3e3e);
        }
        #answer[data-type=empty] {
          color: var(--empty, #dcdcdc);
          font-style: italic;
        }
        #answer:empty {
          display: none;
        }
        #answer chart-view {
          display: block;
          margin-top: 10px;
          outline: none;
        }
        #answer table-view {
          display: block;
          overflow: auto;
        }
      </style>
      <div class="box" tabindex=-1>
        <span id="margin"></span>
        <div id="editor">
          <span id="count">#1</span>
          <span id="db">DB 1</span>
          <editor-view id="view"></editor-view>
          <div id="tools">
            <button id="plot" class="hidden" title="-> if one column is selected, plots the column data versus [0, 1, 2, ...]&#013;-> if multiple columns are selected, plots all columns versus the first column&#013;-> if Ctrl or Command key is pressed, plots all columns versus [0, 1, 2, ...]&#013;-> if the Shift key is pressed, plots each row versus the first row&#013;-> if the Shift + Ctrl keys or Shift + Command keys are pressed, plots all rows versus [0, 1, 2, ..]">Plot</button>
            <button id="export" class="hidden" title="downloads selected entries or the entire table as a comma-separated CVS file.">Export</button>
            <button id="exec" title="executes the SQL statement on the active database">Execute (Enter)</button>
            <button id="close" title="removes the entire box and its results">Close</button>
          </div>
        </div>
        <div id="answer"></div>
      </div>
    `;
  }
  connectedCallback() {
    const {shadowRoot} = this;
    const editor = shadowRoot.getElementById('editor');
    editor.onkeydown = e => {
      if (e.code === 'Enter' && e.shiftKey === false) {
        e.preventDefault();
        this.dispatchEvent(new Event('submit'));
      }
    };
    const ev = editor.querySelector('editor-view');
    ev.addEventListener('hit-start', () => {
      this.dispatchEvent(new Event('hit-start'));
    });
    ev.addEventListener('hit-end', () => {
      this.dispatchEvent(new Event('hit-end'));
    });
    ev.addEventListener('focus', () => {
      this.dispatchEvent(new Event('focus'));
    })

    shadowRoot.getElementById('export').addEventListener('click', () => {
      const columnDelimiter = ',';
      const lineDelimiter = '\n';

      for (const view of [...shadowRoot.querySelectorAll('table-view')]) {
        const content = view.export().map(a => {
          return a.map(name => {
            return typeof name === 'string' && name.includes(columnDelimiter) ? `"${name}"` : name;
          }).join(columnDelimiter)
        }).join(lineDelimiter);
        const blob = new Blob([content]);
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'exported.csv';
        a.click();
        URL.revokeObjectURL(href);
      }
    });
    shadowRoot.getElementById('exec').addEventListener('click', () => {
      this.dispatchEvent(new Event('submit'));
    });
    shadowRoot.getElementById('close').addEventListener('click', () => {
      this.dispatchEvent(new Event('close'));
      this.remove();
    });
    shadowRoot.getElementById('plot').addEventListener('click', e => {
      const answer = shadowRoot.getElementById('answer');
      for (const t of [...shadowRoot.querySelectorAll('table-view')].filter(v => v.selected)) {
        const data = t.export().filter(a => a);

        const inverted = [];
        if (e.shiftKey) {
          for (let x = 0; x < data[0].length; x += 1) {
            inverted[x] = inverted[x] || [];
            for (let y = 0; y < data.length; y += 1) {
              inverted[x].push(data[y][x]);
            }
          }
          // data = inverted;
        }
        const ref = e.shiftKey ? inverted : data;
        const meta = e.ctrlKey || e.metaKey;
        const labels = ref.map((d, i) => d.length === 1 || meta ? i : d[0]);

        const view = document.createElement('chart-view');
        answer.insertBefore(view, t.nextSibling);

        const sample = Array(ref[0].length === 1 || meta ? ref[0].length : ref[0].length - 1).fill(0);
        const datasets = sample.map((d, i) => ({
          label: 'line #' + (i + 1),
          data: ref.map((d, j) => ref[j][ref[j].length === 1 || meta ? i : i + 1])
        })).filter(a => a.data.some(v => v));

        view.plot(labels, datasets);
        view.setAttribute('tabindex', '-1');
        view.focus();
      }
    });
  }
  get question() {
    const {shadowRoot} = this;
    const editor = shadowRoot.getElementById('view');
    return editor.value;
  }
  set question(msg) {
    const {shadowRoot} = this;
    const editor = shadowRoot.getElementById('view');
    editor.value = msg;
    editor.dispatchEvent(new Event('input'));
    this.dispatchEvent(new Event('submit'));
    this.focus();
  }
  badge(count = 1) {
    const {shadowRoot} = this;
    shadowRoot.getElementById('count').textContent = '#' + count;
  }
  origin(db) {
    const {shadowRoot} = this;
    shadowRoot.getElementById('db').textContent = 'DB ' + db;
  }
  set error(msg) {
    const {shadowRoot} = this;
    const answer = shadowRoot.getElementById('answer');
    answer.dataset.type = 'error';
    answer.textContent = msg;
    shadowRoot.getElementById('export').classList.add('hidden');
  }
  get answer() {
    const {shadowRoot} = this;
    const answer = shadowRoot.getElementById('answer');

    return answer._;
  }
  set answer(msg) {
    const {shadowRoot} = this;
    const answer = shadowRoot.getElementById('answer');
    if (msg.length === 0) {
      msg = 'Empty';
      answer.dataset.type = 'empty';
    }
    else {
      answer.dataset.type = 'answer';
    }
    if (Array.isArray(msg)) {
      answer._ = msg;
      answer.textContent = '';
      for (const o of msg) {
        const div = document.createElement('div');
        const view = document.createElement('table-view');
        div.appendChild(view);
        answer.appendChild(div);
        view.structure(o.columns, {
          'numbers': true,
          'mode': 'expand',
          'resize': true,
          'select': true,
          'multi-select': true,
          'rows': 10
        });
        view.feed(o.values);
        // activate plot button
        view.addEventListener('selection-changed', () => {
          const b = [...shadowRoot.querySelectorAll('table-view')].some(v => v.selected);
          shadowRoot.getElementById('plot').classList[b ? 'remove' : 'add']('hidden');
        });
      }
      shadowRoot.getElementById('export').classList.remove('hidden');
    }
    else {
      answer.textContent = msg;
      shadowRoot.getElementById('export').classList.add('hidden');
    }
  }
  focus() {
    const {shadowRoot} = this;
    shadowRoot.getElementById('view').editor.focus();
  }
}
window.customElements.define('box-view', BoxView);
