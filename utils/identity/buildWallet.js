const { Wallets } = require('fabric-network');

const logger = require('../../helpers/logger');

exports.buildWallet = async (walletPath) => {
	// Create a new  wallet : Note that wallet is for managing identities.
	let wallet;
	if (walletPath) {
		wallet = await Wallets.newFileSystemWallet(walletPath);
		logger.info(`Built a file system wallet at ${walletPath}`);
	} else {
		wallet = await Wallets.newInMemoryWallet();
		logger.info('Built an in memory wallet');
	}

	return wallet;
};