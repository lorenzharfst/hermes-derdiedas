const db = require('../models/index');

// Returns an available ID
async function getNewId() {
	// Array that will hold all the currently used IDs
	let idArray = [];
	let idFound = false;
	const MatchModel = db.match;
	let returnId = 9999;

	// Load into idArray all the _id keys of Matches
	await MatchModel.distinct('_id', {})
	.then(data => {
		idArray = data; 
		console.log("Checking availability on this idArray:" + idArray);
		// Get highest id not in the array
		while (!idFound) {
			if (idArray.includes(returnId)) {returnId--; console.log("ID already exists, now trying new ID: " + returnId);}
			else {idFound = true;console.log("Creating match, with id: " + returnId);}
			// On the case the are no more available IDs, increase the scope
			if (returnId === 0) returnId = 999999;
		}
		console.log("Exiting while, creating match with id " + returnId);

		res(returnId);

	})  
	.catch(err => console.log(err.message || "Unknown error"));

	

	return promiseId;
}

module.exports = getNewId;
