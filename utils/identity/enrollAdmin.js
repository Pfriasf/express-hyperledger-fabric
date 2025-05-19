'use strict';
const FabricCAServices = require('fabric-ca-client');

const { buildWallet } = require('./buildWallet');
const { buildConnectionProfile } = require('./buildConnectionProfile');
const logger = require('../../helpers/logger');
logger.category = "Admin enroll"

// Create a new file system based wallet for managing identities.
const walletPath = process.env.WALLET 

const args = process.argv.slice(2); // Ignore the first two arguments (node and script)
const org = args[0];

if (!org) {
    logger.error('Error: You must provide the organization as arguments.');
    logger.error('Usage: node enrrolAdmin.js <org>');
    process.exit(1);
}
async function main(org) {
    try {
        // load the network configuration
        const connectionProfile = await buildConnectionProfile(`connection-${org}.yaml`);        

        // Create a new CA client for interacting with the CA.
        const caInfo = connectionProfile.certificateAuthorities['ca.org1.example.com'];
        
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        const wallet = await buildWallet(walletPath);
        console.log(`Built a CA Client named ${caInfo.caName}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
       
        if (identity) {
            logger.info('An identity for the admin user "admin" already exists in the wallet');
            return;
        }
        console.log('An identity for the admin user "admin" does not exist in the wallet',caInfo );
        // Enroll the admin user, and import the new identity into the wallet.
        let enrollId, enrollSecret;
        if (caInfo.registrar) {
            ({ enrollId, enrollSecret } = caInfo.registrar[0]);
        } else {
            enrollId = 'admin';
            enrollSecret = 'adminpw';
            logger.info('No registrar found, using default enrollId and enrollSecret.');
        }
        const enrollment = await ca.enroll({ enrollmentID: enrollId, enrollmentSecret: enrollSecret });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: process.env.MEMBERID,
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        logger.info('Successfully enrolled user "admin" and imported it into the wallet');

    } catch (error) {
        logger.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main(org);