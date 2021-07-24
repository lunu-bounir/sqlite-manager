import './Chart.js';

const colors = [
  '#bf616a',
  '#ebcb8b',
  '#b48ead',
  '#d08770',
  '#a3be8c'
];

class ChartView extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        #host {
          position: relative;
        }
        canvas {
          max-width: 800px;
          margin: 0 auto;
        }
        #tools {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          background-color: #fff;
        }
        #tools input {
          display: none;
        }
        #tools > * {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          overflow: hidden;
          margin-right: 1px;
          cursor: pointer;
        }
        #tools input:checked + label {
          background: #e0efff;
        }
        svg {
          pointer-events: none;
        }
      </style>
      <div id="host">
        <div id="tools">
          <input type="radio" name="type" id="line"></input>
          <label for="line">
            <svg height="32" width="32" viewBox="0 0 100 100">
              <path d="M72.354,72.77H27.271c-1.242,0-2.25-1.008-2.25-2.25V29.48c0-1.242,1.008-2.25,2.25-2.25s2.25,1.008,2.25,2.25V68.27h42.832  c1.242,0,2.25,1.008,2.25,2.25S73.596,72.77,72.354,72.77z"></path>
              <path d="M34.747,65.322c-0.478,0-0.958-0.152-1.367-0.463c-0.986-0.756-1.173-2.168-0.417-3.155L45.43,45.427  c0.672-0.885,1.89-1.134,2.867-0.606l9.813,5.376l9.135-11.209c0.785-0.961,2.203-1.113,3.167-0.322  c0.964,0.785,1.11,2.2,0.325,3.164L60.418,54.491c-0.691,0.838-1.875,1.066-2.827,0.554l-9.763-5.35L36.534,64.44  C36.091,65.018,35.423,65.322,34.747,65.322z" fill="#bf616a"></path>
            </svg>
          </label>
          <input type="radio" name="type" id="doughnut"></input>
          <label for="doughnut">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M12,2c-1.7,0-3.37,0.43-4.85,1.26C6.71,3.5,6.53,4.03,6.71,4.5C6.9,4.98,7,5.49,7,6    c0,2.18-1.77,3.98-3.95,4c-0.5,0.01-0.92,0.38-0.98,0.88C2.02,11.25,2,11.62,2,12c0,5.51,4.49,10,10,10s10-4.49,10-10    S17.51,2,12,2z M12,15c-1.65,0-3-1.35-3-3c0-1.65,1.35-3,3-3s3,1.35,3,3C15,13.65,13.65,15,12,15z" fill="#ebcb8b"/>
            </svg>
          </label>
          <input type="radio" name="type" id="pie"></input>
          <label for="pie">
            <svg width="19" height="19" viewBox="0 0 16 16">
              <path d="M8,16c4.079,0,7.438-3.055,7.931-7H7.778l-5.027,5.027C4.156,15.253,5.989,16,8,16z" fill="#b48ead"/>
              <path d="M8,0v8h8C16,3.582,12.418,0,8,0z" fill="#d08770"/>
              <path d="M0,8c0,2.047,0.775,3.909,2.04,5.324L7,8.364V8V0.069C3.055,0.562,0,3.921,0,8z" fill="#a3be8c"/>
            </svg>
          </label>
          <span id="close">
            <svg width="20" viewBox="0 0 32 32">
              <polygon points="28.71 4.71 27.29 3.29 16 14.59 4.71 3.29 3.29 4.71 14.59 16 3.29 27.29 4.71 28.71 16 17.41 27.29 28.71 28.71 27.29 17.41 16 28.71 4.71"/>
            </svg>
          </span>
        </div>
        <canvas></canvas>
      </div>
    `;

    this.plots = new Set();
  }
  connectedCallback() {
    const {shadowRoot} = this;
    const div = shadowRoot.querySelector('div');
    const resizeObserver = new ResizeObserver(() => {
      for (const plot of this.plots) {
        plot.resize();
      }
    });
    resizeObserver.observe(div);

    shadowRoot.addEventListener('change', e => {
      const canvas = shadowRoot.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      for (const plot of [...this.plots.values()]) {
        const {labels, datasets} = plot.data;
        this.plots.delete(plot);
        plot.destroy();

        this.plot(labels, datasets.map(d => ({
          data: [...d.data],
          label: d.label
        })), e.target.id);
      }
    });
    shadowRoot.getElementById('close').addEventListener('click', () => {
      this.remove();
    })
  }
  plot(labels, datasets, type = 'line') { // line, pie, doughnut
    const {shadowRoot} = this;
    const canvas = shadowRoot.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    const data = {
      labels,
      datasets: datasets.map((d, i) => Object.assign({
        backgroundColor: type === 'line' ? colors[i % colors.length] : d.data.map((e, i) => colors[i % colors.length]),
        borderColor: type === 'line' ? colors[i % colors.length] : '',
        fill: false
      }, d))
    };
    shadowRoot.getElementById(type).click();
    const plot = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2
      }
    });
    this.plots.add(plot);
  }
}
window.customElements.define('chart-view', ChartView);
