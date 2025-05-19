'use strict';

const FabricCAServices = require('fabric-ca-client');

const { buildWallet } = require('./buildWallet');
const { buildConnectionProfile } = require('./buildConnectionProfile');
const logger = require('../../helpers/logger');
logger.category = "User registration"

// Create a new file system based wallet for managing identities.
const walletPath = process.env.WALLET 

const args = process.argv.slice(2); // Ignore the first two arguments (node and script)
const user = args[0];
const org = args[1];

if (!user || !org) {
    logger.error('Error: You must provide the user and organization as arguments.');
    logger.error('Usage: node registerUser.js <user> <org>');
    process.exit(1);
}

async function main(user, org) {
    console.log(`Registering user ${user} for ${org}`)
 
    try {
        // load the network configuration
        const connectionProfile = await buildConnectionProfile(`connection-${org}.yaml`);

        // Create a new CA client for interacting with the CA.
        const caInfo = connectionProfile.certificateAuthorities['ca.org1.example.com'];
        const caURL = caInfo.url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const wallet = await buildWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(user);
        if (userIdentity) {
            logger.info(`An identity for the user ${user} already exists in the wallet`);
            return;
        }
     
        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            logger.error('An identity for the admin user "admin" does not exist in the wallet');
            logger.error('Run the enrollAdmin.js application before retrying');
            return;
        }
        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');
        logger.info(`An identity for the admin user "admin" already exists in the wallet xxxx`, user);
        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: org ,
            enrollmentID: user,
            role: 'client'
        }, adminUser);
 
        const enrollment = await ca.enroll({
            enrollmentID: user,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: process.env.MEMBERID,
            type: 'X.509',
        };
        await wallet.put(user, x509Identity);
        logger.info(`Successfully registered and enrolled user ${user} and imported it into the wallet`);

    } catch (error) {
        logger.error(`Failed to register user ${user}: ${error}`);
        process.exit(1);
    }
}

main(user, org);