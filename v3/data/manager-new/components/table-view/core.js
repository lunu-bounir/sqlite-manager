class SimpleTableView extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        .root {
          display: grid;
          background-color: var(--bg, #fff);
          border: solid 1px var(--border, #efefef);
          position: relative;
        }
        .root[data-mode="compact"] {
          width: min-content;
        }
        .root > header,
        .root > section {
          display: contents;
        }
        .root > header > div {
          background-color: var(--header-bg, #efefef);
          position: relative;
        }
        .root > section > span {
          padding: 5px;
        }
        .root > section > span[data-type=number] {
          color: var(--number, #b48ead);
        }
        .root > header > div {
          display: flex;
          user-select: none;
        }
        .root > header > div > span:first-child {
          flex: 1;
          padding: 5px;
        }
        .root > header > div > span:last-child {
          width: 1px;
          background-color: var(--drag-bg, var(--resize-bg, #c6c6c6));
          margin: 3px 0;
        }
        .root[data-resize=true] > header > div > span:last-child {
          width: 4px;
          cursor: col-resize;
        }
        .root > header > div:last-child > span:last-child {
          display: none;
        }
        .root > section > span:empty {
          background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38gYGAEESAAEGAAasgJOgzOKCoAAAAASUVORK5CYII=);
        }
        :disabled,
        .root > section > span.disabled {
          pointer-events: none;
          color: #a0a0a0;
          text-shadow: 1px 1px #fcffff;
        }
        .root > section > span.selected,
        .root > section > span.dragged,
        .root > section > span.active {
          color: var(--seleced-bg, #fff);
          background-color: var(--seleced-bg, #006eea);
          background-image: none;
        }
        #tools {
          display: flex;
          position: absolute;
          bottom: 0;
          right: 0;
        }
        #tools input {
          background-color: var(--header-bg, #efefef);
          border: none;
          padding: 2px 8px;
          margin-right: 2px;
          font-size: 12px;
          outline: none;
          cursor: pointer;
        }
        #rows {
          width: 60px;
        }
        .hidden {
          display: none !important;
        }
      </style>
      <div class="root">
        <header></header>
        <section></section>
        <div id="tools">
          <input type="number" id="rows" min="4" value="10">
          <input type="button" id="first" value="First" disabled>
          <input type="button" id="prev" value="Prev" disabled>
          <input type="button" id="next" value="Next" disabled>
          <input type="button" id="last" value="Last" disabled>
        </div>
      </div>
    `;
  }
  structure(rows, options = {
    'numbers': true,
    'mode': 'stretch', // stretch, compact
    'resize': true,
    'select': true,
    'multi-select': true,
    'rows': 10
  }) {
    const {shadowRoot} = this;
    const root = shadowRoot.querySelector('.root');

    this.options = options;
    root.dataset.mode = options.mode;
    root.dataset.resize = options.resize;
    root.dataset.select = options.select;
    root.dataset.multiSelect = options['multi-select'];

    const header = shadowRoot.querySelector('header');
    const rs = options.numbers ? ['#', ...rows] : rows;
    const count = this.count = rs.length;
    rs.forEach(value => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      const drag = document.createElement('span');
      span.textContent = value;

      div.appendChild(span);
      div.appendChild(drag);
      header.appendChild(div);
    });
    if (options.numbers) {
      root.style.gridTemplateColumns = `32px repeat(${count - 1}, ${options.mode === 'compact' ? 'min-content' : '1fr'})`;
    }
    else {
      root.style.gridTemplateColumns = `repeat(${count}, ${options.mode === 'compact' ? 'min-content' : '1fr'})`;
    }
  }
  feed(rows = this.rows, offset = 0) {
    const {shadowRoot, options, count} = this;
    const section = shadowRoot.querySelector('section');

    this.cursor = this.cursor || 0;
    if (offset !== undefined) {
      this.cursor = offset;
    }
    this.rows = rows;

    section.textContent = '';
    rows.slice(this.cursor, this.cursor + options.rows).forEach((row, y) => {
      const rs = [...row, ...Array(count).fill(null)];
      if (options.numbers) {
        rs.unshift(y + 1 + this.cursor);
      }

      rs.slice(0, count).forEach((value, x) => {
        const span = document.createElement('span');
        if (options['multi-select']) {
          span.draggable = 'true';
        }
        span.textContent = value;
        span.dataset.type = typeof value;
        span.dataset.x = x;
        span.dataset.y = y;
        if (x === 0 && options.numbers) {
          span.classList.add('disabled');
        }
        section.appendChild(span);
      });
    });
    shadowRoot.getElementById('first').disabled =
    shadowRoot.getElementById('prev').disabled = this.cursor === 0;

    shadowRoot.getElementById('next').disabled =
    shadowRoot.getElementById('last').disabled =
      this.cursor + options.rows >= rows.length;

    if (rows.length <= options.rows) {
      shadowRoot.getElementById('tools').classList.add('hidden');
    }
  }
  connectedCallback() {
    const {shadowRoot} = this;
    shadowRoot.getElementById('first').addEventListener('click', () => {
      this.feed(undefined, 0);
    });
    shadowRoot.getElementById('prev').addEventListener('click', () => {
      this.feed(undefined, Math.max(0, this.cursor - this.options.rows));
    });
    shadowRoot.getElementById('next').addEventListener('click', () => {
      this.feed(undefined, this.cursor + this.options.rows);
    });
    shadowRoot.getElementById('last').addEventListener('click', () => {
      console.log(this.rows.length, this.options.rows);
      this.feed(undefined, Math.max(0, this.rows.length - this.options.rows));
    });
    shadowRoot.getElementById('rows').addEventListener('input', e => {
      this.options.rows = Math.max(e.target.value, 4);
      this.feed(undefined, this.cursor);
    });
  }
}
class ResizeTableView extends SimpleTableView {
  constructor(...args) {
    super(...args);
    this.sizes = {};
  }
  structure(...args) {
    super.structure(...args);
    if (this.options.resize !== true) {
      return;
    }
    const drags = this.shadowRoot.querySelectorAll('header > div > span:last-child');
    drags.forEach((drag, index) => {
      drag.onmousedown = () => {
        const resize = this.resize.bind(this, index, drag.closest('div'));
        document.addEventListener('mousemove', resize);
        document.onmouseup = () => {
          document.removeEventListener('mousemove', resize);
        };
      };
    });
  }
  resize(index, div, e) {
    const {sizes, shadowRoot, count, options} = this;
    const divs = this.shadowRoot.querySelectorAll('header > div');
    for (let i = 0; i <= index; i += 1) {
      if (sizes[i] === undefined) {
        sizes[i] = divs[i].getBoundingClientRect().width;
        console.log(i, divs[i], sizes[i]);
      }
    }
    sizes[index] += e.movementX;

    const root = shadowRoot.querySelector('.root');

    const statement = [];
    for (let i = 0; i < count; i += 1) {
      statement.push(sizes[i] ? sizes[i] + 'px' : (options.mode === 'compact' ? 'min-content' : '1fr'));
    }
    root.style.gridTemplateColumns = statement.join(' ');
  }
}
class SelectTableView extends ResizeTableView {
  connectedCallback() {
    super.connectedCallback();

    const {shadowRoot} = this;
    shadowRoot.addEventListener('click', e => {
      if (this.options.select) {
        const {target} = e;
        if (target.closest('section')) {
          let skip = false;
          if (e.metaKey === false) {
            const divs = [...section.querySelectorAll('.selected')];
            for (const div of divs) {
              if (div !== target) {
                div.classList.remove('selected');
              }
              else {
                skip = divs.length > 1;
              }
            }
          }
          if (skip === false) {
            target.classList.toggle('selected');
          }
          this.dispatchEvent(new Event('selection-changed'));
        }
      }
    });
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    img.style = `
      position: absolute;
    `;

    document.body.appendChild(img);
    const section = shadowRoot.querySelector('section');
    shadowRoot.addEventListener('dragstart', e => {
      if (this.options['multi-select']) {
        e.dataTransfer.setDragImage(img, 0, 0);

        const {target} = e;
        if (target.closest('section') && e.isTrusted) {
          const drag = this.drag.bind(this, target.dataset.x, target.dataset.y);
          shadowRoot.addEventListener('dragenter', drag);
          document.ondragend = () => {
            shadowRoot.removeEventListener('dragenter', drag);
            // replace dragged with selected
            for (const div of [...section.querySelectorAll('.dragged')]) {
              div.classList.add('selected');
              div.classList.remove('dragged');
            }
            this.dispatchEvent(new Event('selection-changed'));
          };
        }
      }
    });
  }
  drag(x, y, e) {
    if (e.target && e.target.nodeType === Node.ELEMENT_NODE) {
      const xs = [x, e.target.dataset.x].map(Number);
      const ys = [y, e.target.dataset.y].map(Number);

      const section = this.shadowRoot.querySelector('section');
      // clear
      for (const div of [...section.querySelectorAll('.dragged')]) {
        div.classList.remove('dragged');
      }
      if (e.metaKey === false) {
        for (const div of [...section.querySelectorAll('.selected')]) {
          div.classList.remove('selected');
        }
      }

      for (let i = Math.min(...xs); i <= Math.max(...xs); i += 1) {
        for (let j = Math.min(...ys); j <= Math.max(...ys); j += 1) {
          section.querySelector(`[data-x="${i}"][data-y="${j}"]`).classList.add('dragged');
        }
      }
    }
  }
  export() {
    const map = [];
    const section = this.shadowRoot.querySelector('section');
    let area = [...section.querySelectorAll('.selected')];
    if (area.length === 0) {
      area = [...section.querySelectorAll('span:not(.disabled)')];
    }
    const xOffset = Math.min(...area.map(s => Number(s.dataset.x)));
    const yOffset = Math.min(...area.map(s => Number(s.dataset.y)));
    for (const span of area) {
      const x = Number(span.dataset.x) - xOffset;
      const y = Number(span.dataset.y) - yOffset;
      map[y] = map[y] || [];
      map[y] [x] = span.dataset.type === 'number' ? Number(span.textContent) : span.textContent;
    }

    return map;
  }
  get selected() {
    const section = this.shadowRoot.querySelector('section');
    return Boolean(section.querySelector('.selected'));
  }
}
class TableView extends SelectTableView {}
window.customElements.define('table-view', TableView);
