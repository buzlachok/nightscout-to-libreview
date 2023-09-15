const dayjs = require('dayjs');
const uuid = require('uuid');
const colors = require('colors');
const prompt = require('prompt');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/../config.env' });

const libre = require('./functions/libre');
const nightscout = require('./functions/nightscout');

const CONFIG_NAME = 'config.json';
const DEFAULT_CONFIG = {
};

if (!fs.existsSync(CONFIG_NAME)) {
  fs.writeFileSync(CONFIG_NAME, JSON.stringify(DEFAULT_CONFIG));
}

const rawConfig = fs.readFileSync(CONFIG_NAME);
let config = JSON.parse(rawConfig);

    d = new Date();
    year = d.getFullYear();
    month = d.getMonth() + 1; //month starts from 0
    day = d.getDate();
    libreResetDevice = false;
    count=1;

  (async () => {
    const djsDate = dayjs(`${year}-${month}-${day-1}`);
    const fromDate = djsDate.format('YYYY-MM-DD');
    const toDate = djsDate.add(1, 'day').format('YYYY-MM-DD');

    console.log('transfer time span', fromDate.gray, '-', toDate.gray);

	const allData = await nightscout.getNightscoutAllEntries(config.nightscoutUrl, config.nightscoutToken, fromDate, toDate);	

    if (allData.glucoseEntriesScheduled.length > 0 || allData.foodEntries.length > 0 || allData.insulinEntries.length > 0) {
      const auth = await libre.authLibreView(config.libreUsername, config.librePassword, config.libreDevice, libreResetDevice);
      if (!!!auth) {
        console.log('libre auth failed!'.red);

        return;
      }

      await libre.transferLibreView(config.libreDevice, auth, allData.glucoseEntriesScheduled, allData.glucoseEntriesUnscheduled, allData.foodEntries, allData.insulinEntries);
    }
	else
	{
		console.log('No entries'.blue);
	}
  })();

function onErr(err) {
  console.log(err);
  return 1;
}
