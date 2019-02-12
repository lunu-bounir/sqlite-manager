/* globals api, Chart */
const chart = {};
const colors = ['#69d2e7', '#fe4365', '#ecd078', '#556270', '#774f38', '#e8ddcb', '#490a3d', '#594f4f', '#00a0b0', '#e94e77', '#3fb8af', '#d9ceb2', '#ffffff', '#efffcd', '#343838', '#413e4a', '#ff4e50', '#99b898', '#655643', '#00a8c6', '#351330', '#554236', '#ff9900', '#5d4157', '#8c2318', '#fad089', '#ff4242', '#d1e751', '#f8b195', '#1b676b', '#bcbdac', '#5e412f', '#452632', '#eee6ab', '#f0d8a8', '#f04155', '#2a044a', '#bbbb88', '#b9d7d9', '#b3cc57', '#a3a948', '#67917a', '#e8d5b7', '#aab3ab', '#300030', '#ab526b', '#607848', '#a8e6ce', '#3e4147', '#b6d8c0', '#fc354c', '#1c2130', '#edebe6', '#cc0c39', '#dad6ca', '#a7c5bd', '#fdf1cc', '#5c323e', '#230f2b', '#b9d3b0', '#3a111c', '#5e3929', '#1c0113', '#382f32', '#e3dfba', '#000000', '#c1b398', '#8dccad', '#f6f6f6', '#1b325f', '#5e9fa3', '#951f2b', '#413d3d', '#eff3cd', '#2d2d29', '#cfffdd', '#4e395d', '#9dc9ac', '#a1dbb2', '#ffefd3', '#a8a7a7', '#ffedbf', '#f8edd1', '#f38a8a', '#4e4d4a', '#0ca5b0', '#a70267', '#9d7e79', '#edf6ee', '#046d8b', '#4d3b3b', '#fffbb7', '#ff003c', '#fcfef5', '#9cddc8', '#30261c', '#d1313d', '#ffe181', '#aaff00', '#c2412d'];

chart.init = () => {
  if (typeof Chart === 'undefined') {
    return api.require('vendor/Chart.min.js').then(() => api.emit('chart.init'));
  }
  return Promise.resolve();
};

chart.plot = (arrs, result) => {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('height', 60);
  result.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const defaults = {
    label: 'Plot #$',
    showLine: true,
    backgroundColor: '',
    borderColor: '',
    type: 'line',
    borderWidth: 1,
    steppedLine: false
  };

  const data = {
    type: arrs.reduce((p, {query = ''}) => {
      if (query.indexOf('pie') !== -1) {
        return 'pie';
      }
      if (query.indexOf('doughnut') !== -1) {
        return 'doughnut';
      }
      if (query.indexOf('bar') !== -1) {
        return 'bar';
      }
      return p;
    }, 'line'),
    data: {
      labels: arrs[0].x,
      datasets: arrs.map(({x, y, query = ''}, i) => {
        const props = Object.assign({}, defaults);
        if (query) {
          for (const [key, value] of (new URLSearchParams(query)).entries()) {
            if (value === 'true') {
              props[key] = true;
            }
            else if (value === 'false') {
              props[key] = false;
            }
            else if (isNaN(value)) {
              if (/^\[.*\]$/.test(value)) {
                props[key] = value.substr(1, value.length - 2).split(/\s*,\s*/);
              }
              else {
                props[key] = value;
              }
            }
            else {
              props[key] = Number(value);
            }
          }
        }
        const linear = ['line', 'scatter'].indexOf(props.type) !== -1 || props.type === '';

        let backgroundColor = props.backgroundColor || colors[i] + '33';
        if (!linear && !props.backgroundColor) {
          backgroundColor = x.map((o, j) => colors[j % colors.length + x.length * i] + '33');
        }
        let hoverBackgroundColor = props.hoverBackgroundColor || colors[i] + '55';
        if (!linear && !props.hoverBackgroundColor) {
          hoverBackgroundColor = x.map((o, j) => colors[j % colors.length + x.length * i] + '55');
        }
        let borderColor = props.borderColor || colors[i] + '55';
        if (!linear && !props.borderColor) {
          borderColor = x.map((o, j) => colors[j % colors.length + x.length * i] + '55');
        }

        return {
          type: props.type,
          label: props.label.replace('$', i + 1),
          showLine: props.showLine,
          backgroundColor,
          hoverBackgroundColor,
          borderColor,
          borderWidth: props.borderWidth,
          steppedLine: props.steppedLine,
          data: linear ? x.map((x, i) => ({
            x,
            y: y[i]
          })) : y
        };
      })
    },
    options: {
      scales: {
        xAxes: arrs.filter(({query = ''}, i) => i === 0 || query.indexOf('axis=true') !== -1)
          .map(({query = ''}) => {
            const axis = {};
            if (query.indexOf('line') !== -1 || query.indexOf('scatter') !== -1 || query.indexOf('type=') == -1) {
              axis.type = 'linear';
            }
            return axis;
          })
      }
    }
  };

  new Chart(ctx, data);
  result.scrollIntoView();
};

export default chart;
