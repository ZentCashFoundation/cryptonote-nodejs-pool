![Zent Cash](https://github.com/ZentCashFoundation/brand/blob/master/logo/wordmark/zentcash_wordmark_color.png "Zent Cash")

[![Discord](https://img.shields.io/discord/527428494154792960?label=Discord%20-%20Zent%20Cash%20[ZTC])](https://discord.gg/tfaUE2G) 
[![GitHub issues](https://img.shields.io/github/issues/ZentCashFoundation/cryptonote-nodejs-pool?label=Issues)](https://github.com/ZentCashFoundation/cryptonote-nodejs-pool/issues)
[![GitHub contributors](https://img.shields.io/github/contributors-anon/ZentCashFoundation/cryptonote-nodejs-pool?label=Contributors)](https://github.com/ZentCashFoundation/cryptonote-nodejs-pool/graphs/contributors) 
[![GitHub All Releases](https://img.shields.io/github/downloads/ZentCashFoundation/cryptonote-nodejs-pool/total?label=Downloads)](https://github.com/ZentCashFoundation/cryptonote-nodejs-pool) 
![Version](https://img.shields.io/github/v/release/ZentCashFoundation/cryptonote-nodejs-pool)


High performance Node.js (with native C addons) mining pool for CryptoNote based coins. Comes with lightweight example front-end script which uses the pool's AJAX API. Support for Cryptonight (Original, Monero v7, Stellite v7), Cryptonight Light (Original, Aeon v7, IPBC) Cryptonight Fast (Electronero/Crystaleum), Cryptonight Heavy (Ombre), Cryptonight Pico (Zent Cash), Argon2 (Ninjacoin, Bitcoin Nova, Turtlecoin) and RandomX (Monero) algorithms.

#### Table of Contents
* [Features](#features)
* [Usage](#usage)
  * [Requirements](#requirements)
  * [Downloading & Installing](#1-downloading--installing)
  * [Configuration](#2-configuration)
  * [Starting the Pool](#3-start-the-pool)
  * [Host the front-end](#4-host-the-front-end)
  * [Customizing your website](#5-customize-your-website)
  * [SSL](#ssl)
  * [Upgrading](#upgrading)
* [JSON-RPC Commands from CLI](#json-rpc-commands-from-cli)
* [Monitoring Your Pool](#monitoring-your-pool)
* [Community Support](#community--support)
* [Pools Using This Software](#pools-using-this-software)
* [Referral Links](#referral-links)
* [Donations](#donations)
* [Credits](#credits)
* [License](#license)


Features
===

#### Optimized pool server
* TCP (stratum-like) protocol for server-push based jobs
* Compared to old HTTP protocol, this has a higher hash rate, lower network/CPU server load, lower orphan block percent, and less error prone
* Support for Cryptonight (Original, Monero v7, Stellite v7), Cryptonight Light (Original, Aeon v7, IPBC), Cryptonight Heavy (Ombre), Cryptonight Pico (Zent Cash), Argon2 (Ninjacoin, Bitcoin Nova, Turtlecoin) and RandomX (Monero) algorithms.
* Custom API to support coins based on Zent Cash, Ninjacoin, Bitcoin Nova and Turtlecoin (Restful API)
* IP banning to prevent low-diff share attacks
* Socket flooding detection
* Share trust algorithm to reduce share validation hashing CPU load
* Clustering for vertical scaling
* Ability to configure multiple ports - each with their own difficulty
* Miner login (wallet address) validation
* Workers identification (specify worker name as the password)
* Variable difficulty / share limiter
* Set fixed difficulty on miner client by passing "address" param with "+[difficulty]" postfix
* Modular components for horizontal scaling (pool server, database, stats/API, payment processing, front-end)
* SSL support for both pool and API servers
* RBPPS (PROP) payment system

#### Live statistics API
* Currency network/block difficulty
* Current block height
* Network hashrate
* Pool hashrate
* Each miners' individual stats (hashrate, shares submitted, pending balance, total paid, payout estimate, etc)
* Blocks found (pending, confirmed, and orphaned)
* Historic charts of pool's hashrate, miners count and coin difficulty
* Historic charts of users's hashrate and payments

#### Mined blocks explorer
* Mined blocks table with block status (pending, confirmed, and orphaned)
* Blocks luck (shares/difficulty) statistics
* Universal blocks and transactions explorer based on [chainradar.com](http://chainradar.com)

#### Smart payment processing
* Splintered transactions to deal with max transaction size
* Minimum payment threshold before balance will be paid out
* Minimum denomination for truncating payment amount precision to reduce size/complexity of block transactions
* Prevent "transaction is too big" error with "payments.maxTransactionAmount" option
* Option to enable dynamic transfer fee based on number of payees per transaction and option to have miner pay transfer fee instead of pool owner (applied to dynamic fee only)
* Control transactions priority with config.payments.priority (default: 0).
* Set payment ID on miner client when using "[address].[paymentID]" login
* Integrated payment ID addresses support for Exchanges

#### Admin panel
* Aggregated pool statistics
* Coin daemon & wallet RPC services stability monitoring
* Log files data access
* Users list with detailed statistics

#### Pool stability monitoring
* Detailed logging in process console & log files
* Coin daemon & wallet RPC services stability monitoring
* See logs data from admin panel

#### Extra features
* An easily extendable, responsive, light-weight front-end using API to display data
* Onishin's [keepalive function](https://github.com/perl5577/cpuminer-multi/commit/0c8aedb)
* Support for merged mining
* Support for slush mining system (disabled by default)
* E-Mail Notifications on worker connected, disconnected (timeout) or banned (support MailGun, SMTP and Sendmail)
* Telegram channel notifications when a block is unlocked
* Discord channel notifications when a block is unlocked
* Top 10 miners report
* Finder Reward (Top 1)
* Multilingual user interface

Usage
===

#### Requirements
* Coin daemon(s) (find the coin's repo and build latest version from source)
* [Node.js](http://nodejs.org/) v11.0+
  * For Ubuntu: 
 ```
  curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash
  sudo apt-get install -y nodejs
 ```
  * Or use NVM(https://github.com/creationix/nvm) for debian/ubuntu.


* [Redis](http://redis.io/) key-value store v2.6+ 
  * For Ubuntu: 
```
sudo add-apt-repository ppa:chris-lea/redis-server
sudo apt-get update
sudo apt-get install redis-server
 ```
 Dont forget to tune redis-server:
 ```
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo 1024 > /proc/sys/net/core/somaxconn
 ```
 Add this lines to your /etc/rc.local and make it executable
 ```
 chmod +x /etc/rc.local
 ```
 
* libssl required for the node-multi-hashing module
  * For Ubuntu: `sudo apt-get install libssl-dev`

* Boost is required for the cryptoforknote-util module
  * For Ubuntu: `sudo apt-get install libboost-all-dev`
  
* libsodium  
  * For Ubuntu: `sudo apt-get install libsodium-dev`


##### Seriously
Those are legitimate requirements. If you use old versions of Node.js or Redis that may come with your system package manager then you will have problems. Follow the linked instructions to get the last stable versions.

[**Redis warning**](http://redis.io/topics/security): It'sa good idea to learn about and understand software that
you are using - a good place to start with redis is [data persistence](http://redis.io/topics/persistence).

**Do not run the pool as root** : create a new user without ssh access to avoid security issues :
```bash
sudo adduser --disabled-password --disabled-login your-user
```
To login with this user : 
```
sudo su - your-user
```

#### 1) Downloading & Installing


Clone the repository and run `npm update` for all the dependencies to be installed:

```bash
git clone https://github.com/ZentCashFoundation/cryptonote-nodejs-pool.git pool
cd pool

npm update
```

#### 2) Configuration

Copy the `config_examples/COIN.json` file of your choice to `config.json` then overview each options and change any to match your preferred setup.

Explanation for each field:
```javascript
{
    /* Pool host displayed in notifications and front-end */
    "poolHost": "your.pool.host", 
    
    /* Used for storage in redis so multiple coins can share the same redis instance. */
    /* Must match the parentCoin variable in config.js */
    "coin": "Zent", 
    
    /* Used for front-end display */
    "symbol": "ZTC",

    /* Number of coin decimals places for notifications and front-end */
    "coinDecimalPlaces": 2, 
    /* Coin network time to mine one block, see DIFFICULTY_TARGET constant in DAEMON_CODE/src/cryptonote_config.h */
    "coinDifficultyTarget": 60, 
    
    //used on blocks page to generate hyperlinks.
    "blockchainExplorer": "http://explorer.zent.cash/?hash={id}#blockchain_block",
    
    /* Used on the payments page to generate hyperlinks */
    "transactionExplorer": "http://explorer.zent.cash/?hash={id}#blockchain_transaction",

    /* Set daemon type. Supported values: default, forknote (Fix block height + 1), bytecoin (ByteCoin Wallet RPC API) */
    "daemonType": "bytecoin",
    
    /* Set Cryptonight algorithm settings.
    Supported algorithms: cryptonight (default). cryptonight_light and cryptonight_heavy
    Supported variants for "cryptonight": 0 (Original), 1 (Monero v7), 3 (Stellite / XTL)
    Supported variants for "cryptonight_light": 0 (Original), 1 (Aeon v7), 2 (IPBC)
    Supported blob types: 0 (Cryptonote), 1 (Forknote v1), 2 (Forknote v2), 3 (Cryptonote v2 / Masari) */
    "cnAlgorithm": "cryptonight_pico",
    "cnVariant": 2,
    "cnBlobType": 2,
   
    /* True to include block.height in job to miner */
    "includeHeight": true,

    /* Select the RestFul API for Wallet */
    "restfulApiWallet" : true,

    /* Select the RestFul API for Daemon and Wallet */
    "restfulApiDaemonAndWallet": false,	

    /* Logging */
    "logging": {

        "files": {
            
            /* Specifies the level of log output verbosity. This level and anything
            more severe will be logged. Options are: info, warn, or error. */
            "level": "info",

            /* Directory where to write log files. */
            "directory": "logs",

            /* How often (in seconds) to append/flush data to the log files. */
            "flushInterval": 5
        },
        "console": {
            "level": "info",
            /* Gives console output useful colors. If you direct that output to a log file
           then disable this feature to avoid nasty characters in the file. */
            "colors": true
        }
    },
    "hashingUtil": true,
    "childPools": null,

    /* Modular Pool Server */
    "poolServer": {
        "enabled": true,
        "mergedMining": false,
        
        /* Set to "auto" by default which will spawn one process/fork/worker for each CPU
       core in your system. Each of these workers will run a separate instance of your
       pool(s), and the kernel will load balance miners using these forks. Optionally,
       the 'forks' field can be a number for how many forks will be spawned. */
        "clusterForks": "auto",
        
        /* Address where block rewards go, and miner payments come from. */
        "poolAddress": "Your ZTC Wallet address",
       
        /* This is the Integrated address prefix used for miner login validation. */
        "intAddressPrefix": 4419,
        
        /* Poll RPC daemons for new blocks every this many milliseconds. */
        "blockRefreshInterval": 1000,

         /* How many seconds until we consider a miner disconnected. */
        "minerTimeout": 900,

        "sslCert": "./cert.pem", // The SSL certificate
        "sslKey": "./privkey.pem", // The SSL private key
        "sslCA": "./chain.pem", // The SSL certificate authority chain
        "ports": [
            {
                "port": 11151, // Port for mining apps to connect to
                "difficulty": 400000, // Initial difficulty miners are set to
                "desc": "Low end hardware" // Description of port
            },
            {
                "port": 11152,
                "difficulty": 600000,
                "desc": "Mid range hardware"
            },
            {
                "port": 11153,
                "difficulty": 700000,
                "desc": "High end hardware"
            },
            {
                "port": 11154,
                "difficulty": 1000000,
                "desc": "Very hight end hardware"
            }
        ],
        /* Variable difficulty is a feature that will automatically adjust difficulty for
        individual miners based on their hashrate in order to lower networking and CPU
        overhead. */
        "varDiff": {
            "minDiff": 100, // Minimum difficulty
            "maxDiff": 5000000, // Maximum difficulty
            "targetTime": 60, // Try to get 1 share per this many seconds
            "retargetTime": 30, // Check to see if we should retarget every this many seconds
            "variancePercent": 30, // Allow time to vary this % from target without retargeting
            "maxJump": 100 // Limit diff percent increase/decrease in a single retargeting
        },
        
         /* Set payment ID on miner client side by passing <address>.<paymentID> */
        "paymentId": {
            "addressSeparator": "+" // Character separator between <address> and <paymentID>
        },
        
	"separators": [
            {
                "value": "+",
                "desc": "plus"
            },
            {
                "value": ".",
                "desc": "dot"
            }
        ],

        /* Set difficulty on miner client side by passing <address> param with +<difficulty> postfix */
        "fixedDiff": {
            "enabled": true,
            "addressSeparator": "." // Character separator between <address> and <difficulty>
        },
        
        /* Feature to trust share difficulties from miners which can
        significantly reduce CPU load. */
        "shareTrust": {
            "enabled": true,
            "min": 10, // Minimum percent probability for share hashing
            "stepDown": 3, // Increase trust probability % this much with each valid share
            "threshold": 10, // Amount of valid shares required before trusting begins
            "penalty": 30 // Upon breaking trust require this many valid share before trusting
        },

        /* If under low-diff share attack we can ban their IP to reduce system/network load. */
        "banning": {
            "enabled": true,
            "time": 600, // How many seconds to ban worker for
            "invalidPercent": 25, // What percent of invalid shares triggers ban
            "checkThreshold": 30 // Perform check when this many shares have been submitted
        },

        /* Slush Mining is a reward calculation technique which disincentivizes pool hopping and 
        rewards 'loyal' miners by valuing younger shares higher than older shares. Remember
        adjusting the weight!
        More about it here: https://mining.bitcoin.cz/help/#!/manual/rewards */
        "slushMining": {
            "enabled": false, // Enables slush mining. Recommended for pools catering to professional miners
            
            /* Defines how fast the score assigned to a share declines in time. 
            The value should roughly be equivalent to the average round duration in seconds 
            divided by 8. When deviating by too much numbers may get too high for JS. */
            "weight": 300, 
            "blockTime": 60,
            "lastBlockCheckRate": 1
         }
    },

    /* Module that sends payments to miners according to their submitted shares. */
    "payments": {
        "enabled": true,
        "interval": 120, // How often to run in seconds
        "maxAddresses": 100, // Split up payments if sending to more than this many addresses
        "mixin": 3, // Number of transactions yours is indistinguishable from
        "priority": 0, // The transaction priority
        "transferFee": 10, // Fee to pay for each transaction
        "dynamicTransferFee": true, // Enable dynamic transfer fee (fee is multiplied by number of miners)
        "minerPayFee" : true, // Miner pays the transfer fee instead of pool owner when using dynamic transfer fee
        "minPayment": 5000, // Miner balance required before sending payment
        "maxPayment": null, // Maximum miner balance allowed in miner settings 
        "maxTransactionAmount": 0, // Split transactions by this amount (to prevent "too big transaction" error)
        "denomination": 100 // Truncate to this precision and store remainder
    },

```
