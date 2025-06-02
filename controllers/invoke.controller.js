const connection = require('../utils/connection');
const logger = require("../helpers/logger");
const { parseFabricError } = require('../utils/parseFabricError');
const eventHelper = require('../helpers/event-helper');


module.exports.invoke = async (req, res, next) => {

  let { org, user, channelId, contractName, fcn, args } = req.body    
  logger.category = 'invoke'
  let gateway;

  try {
    gateway = await connection.connect(org, user);

    logger.info(`============ START invokeChaincode - Successfully got the fabric connection point for the organization ${org}`);
    // Build a network instance based on the channel where the smart contract is deployed
		logger.info(`Getting network ${channelId}`)
		const network = await gateway.getNetwork(channelId);

		// Get the contract from the network.
		logger.info(`Getting contract ${contractName}`)
		const contract = network.getContract(contractName);
	
		// send query
		logger.info('##### invokeChaincode - Starting invoke request to Fabric');
    
    if (args[2] && typeof args[2] === 'object') {
      args[2] = JSON.stringify(args[2]);
    }


    let tx = await contract.createTransaction(fcn);

    eventHelper.registerCommitListeners(tx);

		let response = await tx.submit(...args);

		logger.info(`============ Finish invokeChaincode - Disconnecting fabric connection point for the organization ${org}`);
		gateway.disconnect()
    
    if (response) {
      let data = response
      res.status(200).json({status:"success", data })
    }
    
  } catch (error) {
    if(gateway) {
      gateway.disconnect();
    }
    next(parseFabricError(error)); 
  }
};

