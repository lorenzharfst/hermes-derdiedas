import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./match.css";
import TextBox from "../components/match.textbox";
import setNextWord from "../utils/setnextword";
import dataService from "../utils/dataservice.js";

/*
 * A match will be a text box with words showing on its right side. You have to write the articles to the words that appear. As you write them, the cursor stays in the same spot and the text keeps getting pushed to the right, disappearing. Once you write the correct article, it'll light up green and the word will scroll up and fade away, as a new word will fade in and scroll from the bottom into the slot, repeating the process. This means: If you get the article wrong, it'll glow red, and that word will not count towards your end score.
 */

const validArticles = ["der", "die", "das"];

const Match = (props) => {
	// Get the player's match and id array in case the playerObject gets lost on the way (format is matchId-playerId)
	const lsPlayerIdArray = (localStorage.getItem('playerIdArray') || '0-0').split('-');
	// Get the matchId from the URL
	const {matchId} = useParams();
	// Load a placeholder wordList for now (wordList is always an array)
	const [wordList, setWordList] = useState(["Lade..."]);
	// Load in the state variable
	const { state } = useLocation();
	// Assign the state variable to the playerObject variable
	const [playerObject, setPlayerObject] = useState(state.playerObject);
	// Set the currentWord variable, the backend already sets isCurrentWord for the first word in the list
	let currentWord = wordList.find((e) => e.isCurrentWord);
	// Initialise the variable for the text input
	const articleInputRef = useRef(null);
	// Initialise the variable for the floating text when you get a correct word
	const animatedText = useRef(null);
	// Navigate variable is for sending the user through different routes programmatically
	const navigate = useNavigate();
	// Initialise the variable for the span element containing the word
	const wordSpan = useRef(null);

	useEffect(() => {
		let done = false;
		if (!done) {
			dataService.get(matchId)
				.then((response) => response.json())
				.then((response) => {
					setWordList(response.wordList);
					// If we have no playerObject and no localStorage of the player, send them to the lobby
					// if the playerObject is valid use that, if not retreive the playerObject through the localStorage
					if (!playerObject && lsPlayerIdArray[0] === '0') {
						navigate(`/${matchId}`);
					} else if (!playerObject && (lsPlayerIdArray[0] === matchId)) {
						setPlayerObject(response.playerList.find(e => e.id === lsPlayerIdArray[1]));
					}
				});
		}






		return () => { done = true; }
	},[]);

	/*
	 * Function that will check if the last 3 characters of TextBox match with the article of the current word:
	 * 1. If it's equivalent, do an animation where the article + the word scroll up and fade out.
	 * 2. Set the wordList to be the next one (there's a util for that)
	 */
	const handleChange = (event) => {
		const input = event.target.value.slice(-3).toLowerCase();
		wordSpan.current.classList.remove("shake-class");
		// Check if user wrote a valid article
		if (validArticles.includes(input)) {
			// Get the last three characters of user input (der, die, das are always three) and check if they are the article belonging to the current word
			if (input.slice(-3) === currentWord.article) {
				// Set the isCorrectWord = true if it wasn't marked as false before (because the user got it wrong)
				if (currentWord.isCorrectWord === null) wordList.find((e) => e.isCurrentWord).isCorrectWord = true;
				// Set the current word into the fadeout element before it changes value
				animatedText.current.innerHTML = currentWord.article.replace(currentWord.article.charAt(0), currentWord.article.charAt(0).toUpperCase()) + " " + currentWord.word;
				// Update the state variable wordList with the setNextWord util function. Notice we pass a new array, through destructuring, as a function or else it wouldn't re-render thinking it's the same array
				setWordList([...setNextWord(wordList)]);
				currentWord = wordList.find((e) => e.isCurrentWord);
				// Empty the text input element
				articleInputRef.current.value = "";
				// Apply the fadeout animation
				animatedText.current.classList.add("fadeout-class");
				// If the playerobject is falsey (for example it doesn't exist because they refresh the match page), send them to the lobby
				if (!playerObject) navigate(`/${matchId}`);
				// Add one to the wordsCompleted number
				playerObject.wordsCompleted++;
				dataService.update(playerObject, matchId);

				// If we just completed the last word, put the count of correct words as the users score
				if (playerObject.wordsCompleted >= 10) {
					playerObject.score = 0;
					wordList.forEach(e => {
						if (e.isCorrectWord) playerObject.score++;
					});
					playerObject.hasPlayed = true;
					localStorage.setItem('playerName', playerObject.name);
					dataService.update(playerObject, matchId)
						.then(() => navigate(`/${matchId}`, { state: { playerObject: playerObject } }))
						.catch(e => alert(e.message));
									}
			} else {
				// Set the isCorrectWord = false if the user got it wrong once
				wordList[wordList.findIndex((e) => e.isCurrentWord)].isCorrectWord = false;
				// Empty the text input element
				articleInputRef.current.value = "";
				wordSpan.current.classList.add("shake-class");
			}
		} else {
			animatedText.current.classList.remove("fadeout-class");
			animatedText.current.innerHTML = "";
		}
	};

	const handleMatchClick = () => {
		if (articleInputRef.current) articleInputRef.current.focus();
	}

	return <div onClick={handleMatchClick} className="match">
			{((wordList.some(e => e.isCurrentWord) === true) && (playerObject.wordsCompleted < 10)) ? 
			(<div>
				<div><TextBox articleInputRef={articleInputRef} onChange={handleChange} />
				<div ref={animatedText} className="animated-text"/></div>
				<span ref={wordSpan} className="word-span">{wordList.find((e) => e.isCurrentWord).word}</span>
			</div>) : 
			(<p className="game-ended">Lade Punktestand...</p>)}
		</div>
};

export default Match;
