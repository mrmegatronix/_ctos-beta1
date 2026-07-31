import Papa from 'papaparse';
import fetch from 'node-fetch';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjplY4qgdlDPmFO4sKUoWHnBPoeqf-rY3Tc0Y50wgDbDutbTn4j_hXhW3aXhYVjvfbIlwcIOF07250/pub?gid=1948723750&single=true&output=csv';

async function test() {
  const res = await fetch(CSV_URL);
  const text = await res.text();
  Papa.parse(text, {
    header: true,
    complete: (results) => {
      console.log('Parsed rows:', results.data.length);
      const row = results.data[1];
      console.log('Row 1 Event Type:', row['Event Type']);
      
      let entCount = 0;
      results.data.forEach(r => {
        const et = (r['Event Type'] || '').toLowerCase();
        if (et.includes('band') || et.includes('karaoke')) entCount++;
      });
      console.log('Entertainment count:', entCount);
    }
  });
}
test();
