const format = {};
/* CSV and SQLite toArray and toString tools */
format.csv = {};
format.csv.toArray = content => {
  const rows = content.split('\r\n');
  return rows.map(row => row
    // remove '"'
    .replace(/""([^"])/g, String.fromCharCode(0) + '$1').replace(/"""$/, String.fromCharCode(0) + '"')
    // remove ','
    .replace(/,"([^"]+)"/, (a, b) => ',"' + b.replace(/,/g, String.fromCharCode(1)) + '"')
    .replace(/^"([^"]+)"/, (a, b) => '"' + b.replace(/,/g, String.fromCharCode(1)) + '"')
    // split
    .split(',')
    // remove closing '"'
    .map(s => s
      .replace(/"/g, '')
      // join '"'
      .split(String.fromCharCode(0)).join('"')
      // join ','
      .split(String.fromCharCode(1)).join(',')
    ).map(s => {
      if (s === '') {
        return '';
      }
      else if (isNaN(s)) {
        return s;
      }
      else if (s.indexOf('.') !== -1) {
        return parseFloat(s);
      }
      return parseInt(s);
    })
  );
};
format.csv.toString = d2arr => {
  return d2arr.map(arr => arr.map(str => {
    if (isNaN(str)) {
      const quote = str.indexOf('"') !== -1 || str.indexOf(',') !== -1;
      str = str.replace(/"/g, '""');
      if (quote) {
        return `"${str}"`;
      }
      else {
        return str;
      }
    }
    return str;
  }).join(',')).join('\r\n');
};
format.sql = {};
format.sql.toColumns = arr => {
  return arr.map(str => {
    if (str.indexOf(' ') !== -1 || str.indexOf('.') !== -1) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(', ');
};
format.sql.toValues = arr => {
  return arr.map(str => {
    if (str === '' || str === null) {
      return 'null';
    }
    else if (isNaN(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    else {
      return str;
    }
  }).join(', ');
};

export default format;
