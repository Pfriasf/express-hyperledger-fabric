require('dotenv').config({ path: '../../.env' });
const path = require('path');
const fs = require('fs');

const yaml = require('js-yaml');

const logger = require('../../helpers/logger');

exports.buildConnectionProfile = (fileName) => {
	logger.info(`Building connection profile from ${fileName}`)
	// load the common connection configuration file

    const ccpPath = `${process.env.CCPATH}/${fileName}`
	const fileExists = fs.existsSync(ccpPath);
	if (!fileExists) {
		throw new Error(`no such file or directory: ${ccpPath}`);
	}
	const contents = fs.readFileSync(ccpPath, 'utf8');

	// build a JSON object from the file contents
	const connectionProfile = yaml.load(contents);   

	logger.info(`Loaded the network configuration located at ${ccpPath}`);
	return 	connectionProfile    

};