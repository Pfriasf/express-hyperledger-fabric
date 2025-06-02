const connection = require('../utils/connection');
const logger = require("../helpers/logger");
const { parseFabricError } = require('../utils/parseFabricError');


module.exports.query = async (req, res, next) => {
    
    let { org, user, channelId, contractName, fcn, args } = req.body    
    let gateway;
    
    try {
        // setup the client for this org
        logger.category = 'query'
        logger.info(`============ START queryChaincode - Successfully got the fabric connection point for the organization ${org}`);
        gateway = await connection.connect(org, user);
        // Build a network instance based on the channel where the smart contract is deployed
		logger.info(`Getting network ${channelId}`)
        console.log(args)

		const network = await gateway.getNetwork(channelId);

        // Get the contract from the network.
		logger.info(`Getting contract ${contractName}`)
		const contract = network.getContract(contractName);

		// send query
        logger.info('##### queryChaincode - Starting query request to Fabric');
        console.log(args)
            if (args[0] && typeof args[0] === 'object') {
                args[0] = JSON.stringify(args[0]);
            }
            console.log(args[0])
        
		let response = await contract.evaluateTransaction(fcn, ...args)
        if (response) {
            let data = JSON.parse(response)
            res.status(200).json({status:"success", data })
        }

		logger.info(`============ Finish queryChaincode - Disconnecting fabric connection point for the organization ${org}`);
        gateway.disconnect()

    } catch (error) {
        if(gateway) {
        gateway.disconnect();
        }
        next(parseFabricError(error)); 
    } 
}
  