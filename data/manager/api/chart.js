/* globals api, Chart */
const chart = {};

chart.init = () => {
  if (typeof Chart === 'undefined') {
    return api.require('venders/Chart.js').then(() => api.emit('chart.init'));
  }
  return Promise.resolve();
};

chart.plot = (ax, ay, result) => {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('height', 60);
  result.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        showLine: true,
        data: ax.map((x, i) => ({
          x,
          y: ay[i]
        }))
      }]
    },
    options: {
      scales: {
        xAxes: [{
          type: 'linear',
          position: 'bottom'
        }]
      }
    }
  });
  result.scrollIntoView();
};

export default chart;
