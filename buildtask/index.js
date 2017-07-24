const tl = require('vsts-task-lib/task');
const vsts = require('vso-node-api');
const fs = require('fs');
const path = require('path');

const serverUrl = tl.getVariable('System.TeamFoundationCollectionUri');
const restAPI = new vsts.WebApi(
	serverUrl,
	vsts.getPersonalAccessTokenHandler(tl.getEndpointAuthorizationParameter('SYSTEMVSSCONNECTION', 'ACCESSTOKEN', false))
);

const secureFileId = tl.getInput('fileInput', true)
const destFile = path.join(
	tl.getPathInput('targetPath', true),
	tl.getPathInput('targetName', false) || tl.getSecureFileName(secureFileId)
)

console.log(`Downloading secureFileId=${secureFileId} to destFile=${destFile}`)

restAPI.getTaskAgentApi().downloadSecureFile(tl.getVariable('SYSTEM.TEAMPROJECT'), secureFileId, tl.getSecureFileTicket(secureFileId), false)
	.then((file) => {
		file.pipe(fs.createWriteStream(destFile))
			.on('finish', () => {
				console.log(`Wrote secure file to ${destFile}`)
			})
			.on('error', () => console.error(`Unable to write secure file to ${destFile}`))
	})
	.catch((e) => console.error(`Unable to download secure file: ${e.message}`))
