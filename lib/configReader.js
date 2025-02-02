// Load required modules
let fs = require('fs');

// Set pool software version
global.version = "v2.6.0";

/**
 * Load pool configuration
 **/

// Get configuration file path
let configFile = (function () {
	for (let i = 0; i < process.argv.length; i++) {
		if (process.argv[i].indexOf('-config=') === 0)
			return process.argv[i].split('=')[1];
	}
	return 'config.json';
})();

// Read configuration file data
try {
	global.config = JSON.parse(fs.readFileSync(configFile));
} catch (e) {
	console.error('Failed to read config file ' + configFile + '\n\n' + e);
	return;
}

/**
 * Developper donation addresses -- thanks for supporting my works!
 **/

let donationAddresses = {
	BTC: '17qFGHhPWLQrGsd9k8BUGNdFerJKijaJCa',
	BCH: 'qq7jengltv0f3rg9qg6llyr2pf4373449ccfgvk33d',
	DASH: 'XmVmSDjFcW3oLwr84vRWJ7aLxCcmZQmATv',
	ETH: '0x5b36048661E96BB53959D65c98459F47263Cd7E3',
	LTC: 'LUF4yJuyBumxraM4xLQybZvh23o7oyK39b',
	BAT: '0x5b36048661E96BB53959D65c98459F47263Cd7E3',
	BTN: 'ECVVceHwZQaNg7BNuAjJXhbQFJnLcmxyxJ7CXNBnb2M5YUsVMKaAD8ceNHiGSqdS7hJWKLEC38kFeWU6F5dVpLm2QPcLWdj',
	CIRQ: 'cirqgBwr2odjCpFpRtxeoq2Ze8eAcghdMa3z6Adr3bxXMbmghyikrajGy2L8iF4LkQJkLKhkgHA2oH6xm2YQ2cak7MmdiTYrKyc',
	XMR: '442uRjHUQp66Q2xqXzqfPVdy8qxrQ56aoCJXH7T5D43DUPybhVKTSTpaQiDvrBkd778dik1aRPNkBH79xi5HbTQL8MVfRT7'

};

global.donations = {};

global.devFee = config.blockUnlocker.devDonation || 0.5;
if (config.blockUnlocker.devDonation === 0){
	global.devFee = 0.0;
}

let wallet = donationAddresses[config.symbol.toUpperCase()];
if (devFee && wallet){
	global.donations[wallet] = devFee;
}
