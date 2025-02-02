// Load required modules
let apiInterfaces = require('./apiInterfaces.js')(config.daemon, config.wallet);

// Initialize log system
let logSystem = 'market';
require('./exceptionWriter.js')(logSystem);

/**
 * Get market prices
 **/
exports.get = function (exchange, tickers, callback) {
    if (!exchange) {
        callback('No exchange specified', null);
        return;
    }
    exchange = exchange.toLowerCase();

    if (!tickers || tickers.length === 0) {
        callback('No tickers specified', null);
        return;
    }

    let marketPrices = [];
    let numTickers = tickers.length;
    let completedFetches = 0;

    getExchangeMarkets(exchange, function (error, marketData) {
        if (!marketData || marketData.length === 0) {
            callback({});
            return;
        }

        for (let i in tickers) {
            (function (i) {
                let pairName = tickers[i];
                let pairParts = pairName.split('-');
                let base = pairParts[0] || null;
                let target = pairParts[1] || null;

                if (!marketData[base]) {
                    completedFetches++;
                    if (completedFetches === numTickers) callback(marketPrices);
                } else {
                    let price = marketData[base][target] || null;
                    if (!price || price === 0) {
                        completedFetches++;
                        if (completedFetches === numTickers) callback(marketPrices);
                    } else {
                        completedFetches++;
                        marketPrices[i] = {
                            ticker: pairName,
                            price: price,
                            source: exchange
                        };
                        if (completedFetches === numTickers) callback(marketPrices);
                    }
                }
            })(i);
        }
    });
};


/**
 * Get Exchange Market Prices
 **/

let marketRequestsCache = {};

function getExchangeMarkets (exchange, callback) {
	callback = callback || function () {};
	if (!exchange) {
		callback('No exchange specified', null);
	}
	exchange = exchange.toLowerCase();

	// Return cache if available
	let cacheKey = exchange;
	let currentTimestamp = Date.now() / 1000;

	if (marketRequestsCache[cacheKey] && marketRequestsCache[cacheKey].ts > (currentTimestamp - 60)) {
		callback(null, marketRequestsCache[cacheKey].data);
		return;
	}

	let target = null;
	let symbol = null;
	let price = 0.0;
	let data = {};

	// TradeOgre
	if (exchange == "tradeogre") {
		apiInterfaces.jsonHttpRequest('tradeogre.com', 443, '', function (error, response) {
			if (error) {
				log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
				return callback(error, null);
			}
			const data = {}; 

			if (Array.isArray(response)) {
				for (let i = 0; i < response.length; i++) {
					const pairData = response[i]; 
					const pairName = Object.keys(pairData)[0]; 
					const pairDetails = pairData[pairName];

					if (!pairName || !pairDetails || !pairDetails.price) continue;

					const pairParts = pairName.split('-');
					if (pairParts.length !== 2) continue;

					const target = pairParts[1];
					const symbol = pairParts[0];
					const price = parseFloat(pairDetails.price);

					if (!price || price === 0) continue;

					if (!data[symbol]) data[symbol] = {};
					data[symbol][target] = price;

					if (symbol === config.symbol && target === config.prices.currency) {
						const redisKey = `${config.coin}:status:price`;
						redisClient.hset(redisKey, 'price', price, (err) => {
							if (err) {
								log('error', logSystem, 'Failed to store price in Redis: %s', [err]);
							} else {
								log('info', logSystem, 'Price %s stored in Redis for %s-%s', [price, symbol, target]);
							}
						});
					}
				}
			} else {
				log('error', logSystem, 'Unexpected response format: %s', [JSON.stringify(response)]);
				return callback(new Error('Invalid response format'), null);
			}

			marketRequestsCache[cacheKey] = {
				ts: currentTimestamp,
				data: data
			};

			callback(null, data);
		}, '/api/v1/markets');
	}
	// Btc-Alpha
	else if (exchange == "btcalpha") {
		apiInterfaces.jsonHttpRequest('btc-alpha.com', 443, '', function (error, response) {
			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);

			let pieces = null;
			if (!error && response) {
				for (let model in response) {
					pieces = response[model]['pair'].split('_');
					target = pieces[1];
					symbol = pieces[0];

					price = +response[model]['price'];
					if (price === 0) continue;

					if (!data[symbol]) data[symbol] = {};
					data[symbol][target] = price;
					
					if (symbol === config.symbol && target === config.prices.currency) {
						const redisKey = `${config.coin}:status:price`;
						redisClient.hset(redisKey, 'price', price, (err) => {
							if (err) {
								log('error', logSystem, 'Failed to store price in Redis: %s', [err]);
							} else {
								log('info', logSystem, 'Price %s stored in Redis for %s-%s', [price, symbol, target]);
							}
						});
					}
				}
			}
			if (!error) marketRequestsCache[cacheKey] = {
				ts: currentTimestamp,
				data: data
			};
			callback(null, data);
		}, '/api/v1/exchanges/');
	 }
	 // Exbitron
	 else if (exchange == "exbitron") {
		apiInterfaces.jsonHttpRequest('api.exbitron.digital', 443, '', function (error, response) {
			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
				
			let pieces = null;
			if (!error && response) {
				for (let model in response) {
					pieces = response[model]['ticker_id'].split('-');
					target = pieces[1];
					symbol = pieces[0];
					
					price = +response[model]['last_price'];
					if (price === 0) continue;

					if (!data[symbol]) data[symbol] = {};
					data[symbol][target] = price;

					if (symbol === config.symbol && target === config.prices.currency) {
						const redisKey = `${config.coin}:status:price`;
						redisClient.hset(redisKey, 'price', price, (err) => {
							if (err) {
								log('error', logSystem, 'Failed to store price in Redis: %s', [err]);
							} else {
								log('info', logSystem, 'Price %s stored in Redis for %s-%s', [price, symbol, target]);
							}
						});
					}
				}
			}
			if (!error) marketRequestsCache[cacheKey] = {
				ts: currentTimestamp,
				data: data
			};
				callback(null, data);
		}, '/api/v1/cg/tickers');
	 }
	 // Xeggex
	 else if (exchange == "xeggex") {
		apiInterfaces.jsonHttpRequest('api.xeggex.com', 443, '', function (error, response) {
			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
	
			let pieces = null;
			if (!error && response) {
				for (let model in response) {
					if (!response[model] || !response[model]['ticker_id'] || !response[model]['last_price']) continue;

					let pieces = response[model]['ticker_id'].split('_');
					if (pieces.length !== 2) continue;
				
					let target = pieces[1];
					let symbol = pieces[0];

					if (symbol !== config.symbol) continue;

					let price = parseFloat(response[model]['last_price']);
					if (isNaN(price) || price <= 0) continue;

					if (!data[symbol]) data[symbol] = {};
					data[symbol][target] = price;
	
					if (symbol === config.symbol && target === config.prices.currency) {
						const redisKey = `${config.coin}:status:price`;
						redisClient.hset(redisKey, 'price', price, (err) => {
							if (err) {
								log('error', logSystem, 'Failed to store price in Redis: %s', [err]);
							} else {
								log('info', logSystem, 'Price %s stored in Redis for %s-%s', [price, symbol, target]);
							}
						});
					}
				}
			}
	
			if (!error) marketRequestsCache[cacheKey] = {
				ts: currentTimestamp,
				data: data
			};
	
			callback(null, data);
		}, '/api/v2/tickers');
	}		
	// Nonkyc
	else if (exchange == "nonkyc") {
		apiInterfaces.jsonHttpRequest('api.nonkyc.io', 443, '', function (error, response) {
			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
				
			let pieces = null;
			if (!error && response) {
				for (let model in response) {
					pieces = response[model]['ticker_id'].split('_');
					target = pieces[1];
					symbol = pieces[0];
					
					price = +response[model]['last_price'];
					if (price === 0) continue;

					if (!data[symbol]) data[symbol] = {};
					data[symbol][target] = price;
					}

					if (symbol === config.symbol && target === config.prices.currency) {
						const redisKey = `${config.coin}:status:price`;
						redisClient.hset(redisKey, 'price', price, (err) => {
							if (err) {
								log('error', logSystem, 'Failed to store price in Redis: %s', [err]);
							} else {
								log('info', logSystem, 'Price %s stored in Redis for %s-%s', [price, symbol, target]);
							}
						});
					}
				}
				if (!error) marketRequestsCache[cacheKey] = {
					ts: currentTimestamp,
					data: data
				};
				callback(null, data);
		}, '/api/v2/tickers');
	}
	// Cratex
	else if (exchange == "cratex") {
		apiInterfaces.jsonHttpRequest2('cratex.io', 443, '', function (error, response) {
			if (error) {
				log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
				return;
			}
	
			if (response && response.markets) {
				response.markets.forEach(market => {
					let pairName = market.market;
					let pairParts = pairName.split('/'); 
					let target = pairParts[1];
					let symbol = pairParts[0];
	
					let price = +market.latest_price;
	
					if (!data[symbol]) data[symbol] = {};
					data[symbol][target] = price;

					if (symbol === config.symbol && target === config.prices.currency) {
						const redisKey = `${config.coin}:status:price`;
						redisClient.hset(redisKey, 'price', price, (err) => {
							if (err) {
								log('error', logSystem, 'Failed to store price in Redis: %s', [err]);
							} else {
								log('info', logSystem, 'Price %s stored in Redis for %s-%s', [price, symbol, target]);
							}
						});
					}
				});
			}
	
			// Cachear los resultados
			if (!error) {
				marketRequestsCache[cacheKey] = {
					ts: currentTimestamp,
					data: data
				};
			}
			callback(null, data);
		}, '/api/v1/get_markets_json.php');
	}
	// Finexbox
	else if (exchange == "finexbox") {
		apiInterfaces.jsonHttpRequest2('xapi.finexbox.com', 443, '', function (error, response) {
			if (error) {
				log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
				return;
			}
	
			if (response && response.result) {
				response.result.forEach(market => {
					let pairName = market.market;
					let pairParts = pairName.split('_'); 
					let target = pairParts[1];
					let symbol = pairParts[0];
	
					let price = +market.price;
	
					if (!data[symbol]) data[symbol] = {};
					data[symbol][target] = price;

					if (symbol === config.symbol && target === config.prices.currency) {
						const redisKey = `${config.coin}:status:price`;
						redisClient.hset(redisKey, 'price', price, (err) => {
							if (err) {
								log('error', logSystem, 'Failed to store price in Redis: %s', [err]);
							} else {
								log('info', logSystem, 'Price %s stored in Redis for %s-%s', [price, symbol, target]);
							}
						});
					}
				});
			}
	
			// Cachear los resultados
			if (!error) {
				marketRequestsCache[cacheKey] = {
					ts: currentTimestamp,
					data: data
				};
			}
			callback(null, data);
		}, '/v1/market');
	}
	// Coingecko	
	else if (exchange == "coingecko") {
		apiInterfaces.jsonHttpRequest('api.coingecko.com', 443, '', function (error, response) {
			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
			if (!error && response) {
				let matchingCoin = response.filter(coin => {
					return coin.symbol === config.symbol.toLowerCase() ? coin.name.toLowerCase() : ''
				})
				apiInterfaces.jsonHttpRequest('api.coingecko.com', 443, '', function (error, response) {
					if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
					let data = {};
					if (!error && response.tickers) {
						for (let model in response.tickers) {
							target = response.tickers[model].target
							symbol = response.tickers[model].base

							price = +response.tickers[model].last
							if (price === 0) continue;

							if (!data[symbol]) data[symbol] = {};
							data[symbol][target] = price;

							if (symbol === config.symbol && target === config.prices.currency) {
								const redisKey = `${config.coin}:status:price`;
								redisClient.hset(redisKey, 'price', price, (err) => {
									if (err) {
										log('error', logSystem, 'Failed to store price in Redis: %s', [err]);
									} else {
										log('info', logSystem, 'Price %s stored in Redis for %s-%s', [price, symbol, target]);
									}
								});
							}
						}
					}
					if (!error) marketRequestsCache[cacheKey] = {
						ts: currentTimestamp,
						data: data
					};
					callback(null, data);
				}, `/api/v3/coins/${matchingCoin[0].id}/tickers`);

			}
		}, `/api/v3/coins/list`);
	}
	else {
		callback('Exchange not supported: ' + exchange);
	}
}
exports.getExchangeMarkets = getExchangeMarkets;

/**
 * Get Exchange Market Price
 **/

let priceRequestsCache = {};

function getExchangePrice (exchange, base, target, callback) {
	callback = callback || function () {};

	if (!exchange) {
		callback('No exchange specified');
	} else if (!base) {
		callback('No base specified');
	} else if (!target) {
		callback('No target specified');
	}

	exchange = exchange.toLowerCase();
	base = base.toUpperCase();
	target = target.toUpperCase();

	// Return cache if available
	let cacheKey = exchange + '-' + base + '-' + target;
	let currentTimestamp = Date.now() / 1000;

	let error = null;
	let price = 0.0;
	let data = {};
	let ticker = null;

	if (priceRequestsCache[cacheKey] && priceRequestsCache[cacheKey].ts > (currentTimestamp - 60)) {
		callback(null, priceRequestsCache[cacheKey].data);
		return;
	}

	// TradeOgre
	if (exchange == "tradeogre") {
		ticker =  base + '-' + target;
		apiInterfaces.jsonHttpRequest('tradeogre.com', 443, '', function (error, response) {
			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
			if (response.message) log('warn', logSystem, 'TradeOgre API error: %s', [response.message]);

			error = response.message ? response.message : error;
			price = +response.price || null;
			if (!price) log('warn', logSystem, 'No exchange data for %s using %s', [ticker, exchange]);

			data = {
				ticker: ticker,
				price: price,
				source: exchange
			};
			if (!error) priceRequestsCache[cacheKey] = {
				ts: currentTimestamp,
				data: data
			};
			callback(error, data);
		}, '/api/v1/ticker/' + ticker);
	}
	else if (exchange == "exbitron") {
		ticker = base + '-' + target;
		apiInterfaces.jsonHttpRequest('api.exbitron.digital', 443, '', function (error, response) {
			if (error) {
				log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
				callback(error, null);
				return;
			}
	
			if (response.status !== "OK" || response.hasError || !response.data || !response.data.market || typeof response.data.market.rate === 'undefined') {
				let apiError = response.hasError ? 'API returned an error' : 'Invalid response structure';
				log('warn', logSystem, 'Exbitron API error: %s', [apiError]);
				callback(apiError, null);
				return;
			}
	
			let price = response.data.market.rate || null; 
			if (!price) {
				log('warn', logSystem, 'No exchange data for %s using %s', [ticker, exchange]);
			}
	
			let data = {
				ticker: ticker,
				price: price,
				source: exchange
			};
	
			if (price) {
				priceRequestsCache[cacheKey] = {
					ts: currentTimestamp,
					data: data
				};
			}
	
			callback(null, data);
		}, `/api/v1/trading/info/` + ticker);
	}	
	else if (exchange == "xeggex") {
		ticker = base + '_' + target;	
		apiInterfaces.jsonHttpRequest('api.xeggex.com', 443, '', function (error, response) {

			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
			if (response.message) log('warn', logSystem, 'Xeggex API error: %s', [response.message]);

			error = response.message ? response.message : error;

			price = response[0] != undefined ? response[0]['price'] : null;
			if (!price) log('warn', logSystem, 'No exchange data for %s using %s', [ticker, exchange]);

			data = {
				ticker: ticker,
				price: price,
				source: exchange
			}
			if (!error) priceRequestsCache[cacheKey] = {
				ts: currentTimestamp,
				data: data
			};
			callback(error, data);
		}, `/api/v2/ticker/` + base + '/' + target);
	}
	else if (exchange == "nonkyc") {
		ticker = base + '_' + target;	
		apiInterfaces.jsonHttpRequest('api.nonkyc.io', 443, '', function (error, response) {

			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
			if (response.message) log('warn', logSystem, 'Nonkyc Exchange API error: %s', [response.message]);

			error = response.message ? response.message : error;

			price = response[0] != undefined ? response[0]['price'] : null;
			if (!price) log('warn', logSystem, 'No exchange data for %s using %s', [ticker, exchange]);

			data = {
				ticker: ticker,
				price: price,
				source: exchange
			}
			if (!error) priceRequestsCache[cacheKey] = {
				ts: currentTimestamp,
				data: data
			};
			callback(error, data);
		}, `/api/v2/ticker/` + base + '/' + target);
	}
	else if (exchange == "cratex") {
		ticker = base + '/' + target;
		apiInterfaces.jsonHttpRequest2('cratex.io', 443, '', function (error, response) {
			if (error) {
				log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
				callback(error, null);
				return;
			}
	
			if (!response) {
				log('warn', logSystem, 'Invalid response from %s for %s', [exchange, ticker]);
				callback(new Error('Invalid response format'), null);
				return;
			}

			const price = response.latest_price ? parseFloat(response.latest_price) : null;
			if (!price) {
				log('warn', logSystem, 'No price data for %s using %s', [ticker, exchange]);
				callback(new Error('Price not found'), null);
				return;
			}
	
			const data = {
				ticker: ticker,
				price: price,
				source: exchange
			};
	
			if (!error) {
				priceRequestsCache[cacheKey] = {
					ts: currentTimestamp,
					data: data
				};
			}
			callback(null, data);
		}, `/api/v1/get_markets.php?market=` + ticker);
	}
	else if (exchange == "finexbox") {
		ticker = base + '_' + target;
		apiInterfaces.jsonHttpRequest2('xapi.finexbox.com', 443, '', function (error, response) {
			if (error) {
				log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
				callback(error, null);
				return;
			}
	
			if (!response) {
				log('warn', logSystem, 'Invalid response from %s for %s', [exchange, ticker]);
				callback(new Error('Invalid response format'), null);
				return;
			}

			const price = response.result.price ? parseFloat(response.result.price) : null;
			if (!price) {
				log('warn', logSystem, 'No price data for %s using %s', [ticker, exchange]);
				callback(new Error('Price not found'), null);
				return;
			}
	
			const data = {
				ticker: ticker,
				price: price,
				source: exchange
			};
	
			if (!error) {
				priceRequestsCache[cacheKey] = {
					ts: currentTimestamp,
					data: data
				};
			}
			callback(null, data);
		}, `/v3/ticker?market=` + ticker);
	}		
	// Btc-Alpha
	else if (exchange == "btcalpha") {
		ticker = base + '_' + target;
		apiInterfaces.jsonHttpRequest('btc-alpha.com', 443, '', function (error, response) {

			if (error) log('error', logSystem, 'API request to %s has failed: %s', [exchange, error]);
			if (response.message) log('warn', logSystem, 'BTC-Alpha API error: %s', [response.message]);

			error = response.message ? response.message : error;

			price = response[0] != undefined ? response[0]['price'] : null;
			if (!price) log('warn', logSystem, 'No exchange data for %s using %s', [ticker, exchange]);

			data = {
				ticker: ticker,
				price: price,
				source: exchange
			}
			if (!error) priceRequestsCache[cacheKey] = {
				ts: currentTimestamp,
				data: data
			};
			callback(error, data);
		}, '/api/v1/exchanges/?pair=' + ticker + '&limit=1');

	}
	else {
		callback('Exchange not supported: ' + exchange);
	}
}
exports.getExchangePrice = getExchangePrice;
