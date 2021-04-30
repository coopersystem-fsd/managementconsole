import json2csv from 'json2csv';

export default function ({ data = [], filename = 'csv-export' }) {
  json2csv({ data }, (err, csv) => {
    const c = csv.replace(/\"/g, ''); //eslint-disable-line
    const blob = new Blob([c], { type: 'text/csv;charset=utf-8;' });

    if (window.navigator.msSaveBlob) { // IE 10+
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  });
}
