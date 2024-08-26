const db = require("../models/index");
const Match = db.match;
const getNewId = require('../utils/match.getnewid');

// Function to return a Match. It will return a match object by its id
exports.findOne = (req, res) => {
	const matchId = req.params.matchId;

	Match.find({ _id: matchId })
		.then((data) => {
			if (!data) res.status(404).send({ message: `Couldn't find match ${id}` });
			else res.send(data[0]);
		})
		.catch((err) => {
			res
				.status(500)
				.send({ message: err.message || "Unknown error finding the match." });
		});
};

// Function to create a new Lobby, it will return a new matchId. It will create a Match document with the given playerList and the created matchId
exports.create = (req, res) => { 
	getNewId().then(newId => {
	// Create the Match object to be inserted to the DB
	const newMatch = new Match({
		_id: newId,
		playerList: [],
		isOngoing: false
	});
	console.log(newMatch);
	// Save the Match object in the DB
	newMatch
		.save(newMatch)
		.then((data) => {
			res.send(data);
		})
		.catch((err) => {
			console.log(err.message);
			res.status(500).send({
				message: err.message || "Unknown error creating the match.",
			});

		});
	});

	
	};


exports.update = (req, res) => {
	// Get the Match object that comes with the request and initialise a Match object with it
	const player = req.body;
	console.log("Updating match with following object:");
	console.log(player);
	Match.find({ _id: req.params.matchId })
		.then((latestMatchArray) => {
			latestMatch = latestMatchArray[0];
			console.log("Found match to update with id: " + req.params.matchId);
			console.log(latestMatch);
			const indexOfPlayer = latestMatch.playerList.findIndex(e => e.id === player.id);
;
			// We assume we will only receive player objects here.
			// If the player already exists, substitute it with the new player object. If it's new, assign it an id and add it to the playerList.
			if (indexOfPlayer != -1) {
				latestMatch.playerList[indexOfPlayer] = player;
				console.log("Player was found in match, substituting.");
			}
			else {
				console.log("Player not found, assigning id: " + latestMatch.playerList.length);
				// Add the player id (last id + 1)
				player.id = latestMatch.playerList.length;
				latestMatch.playerList.push(player);
			}
			latestMatch
				.replaceOne(latestMatch)
				.then((data) => {
					console.log("Updating match:");
					console.log(latestMatch);
					res.send(latestMatch);
				})
				.catch(err => {
					console.log(err.message);
					res.status(500).send({
						message: err.message || "Unknown error updating the match."
					});
				});

			// TODO: If you're setting the last player to wordsComplete = 10, also set the match to isOngoing = false
		});
}

exports.startMatch = (req, res) => {
	// Receive a matchId and set that match isOngoing variable to true and assign words to it
	const matchId = req.params.matchId;
	// Temp wordList for testing purposes.
	const loadedWords = [
		{ article: "die", word: "Limousine", isCurrentWord: true, isCorrectWord: null },
		{ article: "die", word: "Frau", isCurrentWord: false, isCorrectWord: null },
		{ article: "der", word: "Mann", isCurrentWord: false, isCorrectWord: null },
		{ article: "das", word: "Interesse", isCurrentWord: false, isCorrectWord: null },
		{ article: "der", word: "Meister", isCurrentWord: false, isCorrectWord: null },
		{ article: "die", word: "Bremse", isCurrentWord: false, isCorrectWord: null },
		{ article: "der", word: "Junge", isCurrentWord: false, isCorrectWord: null },
		{ article: "das", word: "Kind", isCurrentWord: false, isCorrectWord: null },
		{ article: "die", word: "Mermelade", isCurrentWord: false, isCorrectWord: null },
		{ article: "die", word: "Mitfahrgelegenheit", isCurrentWord: false, isCorrectWord: null }
	];

	Match.find({ _id: matchId })
		.then((match) => {
			let retrievedMatch = match[0];
			retrievedMatch.wordList = loadedWords;
			retrievedMatch.isOngoig = true;
			retrievedMatch.save(retrievedMatch)
				.then(() => res.status(200).send())
				.catch((error) => res.status(500).send({ message: error.message }));
		});
}
