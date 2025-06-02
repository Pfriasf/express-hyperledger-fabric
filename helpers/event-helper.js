const connection = require('../utils/connection');
const logger = require("../helpers/logger");
const moment = require('moment');



const eventHelper = {};
const channelId = process.env.CHANNEL_NAME || 'mychannel';
const contractName = process.env.CHAINCODE_NAME || 'helloContract';

// function to display transaction data
function showTransactionData(transactionData) {
	const creator = transactionData.actions[0].header.creator;
	logger.debug(`    - submitted by: ${creator.mspid}`);
	for (const endorsement of transactionData.actions[0].payload.action.endorsements) {
		logger.debug(`    - endorsed by: ${endorsement.endorser.mspid}`);
	}
	const chaincode = transactionData.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec;
	logger.debug(`    - chaincode:${chaincode.chaincode_id.name}`);
	logger.debug(`    - function:${chaincode.input.args[0].toString()}`);
	for (let x = 1; x < chaincode.input.args.length; x++) {
		logger.debug(`    - arg:${chaincode.input.args[x].toString()}`);
	}
}

async function getInteraces(){
    
    logger.category = 'event-helper-getInterfaces'
    logger.debug('============ Get Fabric interfaces.');

    const org = "org3";
    const user = "admin3";
    
    let gateway 
    // Create a new gateway for connecting to our peer node.
    try {
        logger.debug('============ Connect to Fabric gateway.');
        gateway = await connection.connect(org, user);
    
    } catch (err) {
        logger.error('============ Failed to establish gateway' + err);
    }

    logger.info(`Getting network ${channelId}`)
    const network = await gateway.getNetwork(channelId);
    
    // Get the contract from the network.
    logger.info(`Getting contract ${contractName}`)
    const contract = network.getContract(contractName);
    
    return { contract , network }
}



    //  - - - - - -  C H A I N C O D E   E V E N T S   L I S T E N E R - - - - - - - //
eventHelper.registerChaincodeListener = async function () {

    const { contract } = await getInteraces();

    try {
        let listener;

        listener = async (event) => {
                logger.category = 'event-helper-registerEvent'
                const asset = JSON.parse(event.payload.toString());
                logger.debug(`<-- Contract Event Received: ${event.eventName} - ${JSON.stringify(asset)}`);
                logger.debug(`*** Event: ${event.eventName}`);
                const eventTransaction = event.getTransactionEvent();
                logger.debug(`*** transaction: ${eventTransaction.transactionId} status:${eventTransaction.status}`);
                showTransactionData(eventTransaction.transactionData);
                const eventBlock = eventTransaction.getBlockEvent();
                logger.debug(`*** block: ${eventBlock.blockNumber.toString()}`);
        };
        // start the client side event service and register the listener
        logger.debug("**** CHAINCODE EVENTS ****");
        logger.debug(`--> Start contract event stream to peer in ${process.env.ORG1}`);
        await contract.addContractListener(listener);
    } catch (eventError) {
        logger.debug(`<-- Failed: Setup contract events - ${eventError}`);
    }
}
    //  - - - - - -  B L O C K  E V E N T S  L I S T E N E R - - - - - - - - - -//
   
eventHelper.registerBlockListener = async function () {

    const { network } = await getInteraces();

    try {
        let listener;


        // create a block listener
        listener = async (event) => {
            let response = {
                block_id: event.blockNumber.toString(),
                txs: []
            };

            let processedTxIds = new Set();
            let tx = '';

            logger.debug(`<-- Block Event Received - block number: ${event.blockNumber.toString()}`);
            const transEvents = event.getTransactionEvents();
            for (const transEvent of transEvents) {
                logger.debug(`*** transaction event: ${transEvent.transactionId}`);
                if (transEvent.transactionData) {
                    showTransactionData(transEvent.transactionData);
                    for (let i in event.blockData.data.data){
                        try {
                            let txId = event.blockData.data.data[i].payload.header.channel_header.tx_id;
                            if (!processedTxIds.has(txId)) {
                                tx = {
                                    tx_id: event.blockData.data.data[i].payload.header.channel_header.tx_id,
                                    timestamp: moment(Date.parse(event.blockData.data.data[i].payload.header.channel_header.timestamp)).format(process.env.DATE_FORMAT),
                                    creator_msp_id: event.blockData.data.data[i].payload.header.signature_header.creator.mspid,
                                };

                                processedTxIds.add(txId); 
                                response.txs.push(tx);
                            }
                        }
                        catch (e) {
                            logger.warn('error in removing buffers - this does not matter', e);
                        }
                        //-- parse for parameters -- //
                    }
                }
            }
            logger.info(response);
        };
        // now start the client side event service and register the listener
        logger.category = 'event-helper-registerEvent'
        logger.debug("**** BLOCK EVENTS ****");
        logger.debug(`--> Start data block event stream`);
        await network.addBlockListener(listener, {type: 'full'});
    } catch (eventError) {
        logger.debug(`<-- Failed: Setup block events - ${eventError}`);
    }
}

eventHelper.registerCommitListeners = async function(tx) {
    const { network } = await getInteraces();

    try{

        let listener;

        listener = async (error, event) => {

            let response = {
                tx_id: event.transactionId,
                status: event.status
            };

            logger.info(response);
        }   
        logger.category = 'event-helper-registerEvent'
        logger.debug("**** COMMIT EVENT ****");
        logger.debug(`--> Start commit event stream`);
        await network.addCommitListener(listener, network.getChannel().getEndorsers(), tx.getTransactionId());

    } catch (eventError) {
        logger.debug(`<-- Failed: Setup commit event - ${eventError}`);
    }
}

module.exports = eventHelper;