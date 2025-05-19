const { Gateway } = require('fabric-network');

const { buildConnectionProfile } = require('./identity/buildConnectionProfile');
const { buildWallet } = require('./identity/buildWallet');
const logger = require('../helpers/logger');
logger.category = 'connection'

// Create a new file system based wallet for managing identities.
const walletPath = process.env.WALLET 


exports.connect = async (org, user) => {

	try {
		console.log(`Connecting to ${org} as ${user}`)

		// load the network configuration
		const connectionProfile = await buildConnectionProfile(`connection-${org}.yaml`);    

		const wallet = await buildWallet(walletPath);

		const gateway = new Gateway();
		
		logger.info(`Connecting to the Gateway with a connection profile`)
		await gateway.connect(connectionProfile, {
			wallet,
			identity: user,
			discovery: { enabled: true, asLocalhost: true } 
		});		

		return(gateway)

	} catch(error) {
		logger.error(`Connection failed: ${error}`);
		throw error;
	}
}
