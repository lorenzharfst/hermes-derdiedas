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
	const {matchId} = useParams();
	const [wordList, setWordList] = useState(["Lade..."]);
	const { state } = useLocation();
	const [playerObject, setPlayerObject] = useState(state.playerObject);
	console.log(playerObject);
	let currentWord = wordList.find((e) => e.isCurrentWord);
	const articleInputRef = useRef(null);
	const animatedText = useRef(null);

	useEffect(() => {
		let done = false;
		if (!done) {
			dataService.get(matchId)
				.then((response) => response.json())
				.then((response) => {
					console.log("Loaded Match:");
					console.log(response);
					setWordList(response.wordList);
				});
		}

		return () => { done = true; }
	},[]);

	/*
	 * Function that will check if the last 3 characters of TextBox match with the article of the current word:
	 * 1. If it's equivalent, do an animation where the article + the word scroll up and fade out.
	 * 2. Set the wordList to be the next one (there's a util for that)
	 * 3. Make the new word come fade in from the bottom next to the textbox (where the last word was before guessing)
	 */
	const handleChange = (event) => {
		const input = event.target.value.slice(-3).toLowerCase();
		// Check if user wrote an article
		if (validArticles.includes(input)) {
			if (input.slice(-3) === currentWord.article) {
				// Set the isCorrectWord = true if it wasn't marked as false before (because the user got it wrong)
				if (currentWord.isCorrectWord === null)
					wordList[wordList.findIndex((e) => e.isCurrentWord)].isCorrectWord =
						true;
				// Set the current word into the fadeout element before it changes value
				animatedText.current.innerHTML = currentWord.article.replace(currentWord.article.charAt(0), currentWord.article.charAt(0).toUpperCase()) + " " + currentWord.word;
				// Update the state variable wordList with the setNextWord util function. Notice we pass a new array, through destructuring, as a function or else
				// it wouldn't re-render thinking it's the same array
				setWordList([...setNextWord(wordList)]);
				currentWord = wordList.find((e) => e.isCurrentWord);
				articleInputRef.current.value = "";
				// Apply the fadeout animation
				animatedText.current.classList.add("fadeout-class");
				// Add one to the wordsCompleted number
				playerObject.wordsCompleted++;
				dataService.update(playerObject, matchId);
			} else {
				// Set the isCorrectWord = false if the user got it wrong once
				wordList[wordList.findIndex((e) => e.isCurrentWord)].isCorrectWord =
					false;
				articleInputRef.current.value = "";
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
			{(wordList.some(e => e.isCurrentWord) === true) ? 
			(<div>
				<div><TextBox articleInputRef={articleInputRef} onChange={handleChange} />
				<div ref={animatedText} className="animated-text"/></div>
				<span className="word-span">{wordList.find((e) => e.isCurrentWord).word}</span>
			</div>) : 
			(<p className="game-ended">Lade Punktestand...</p>)}
		</div>
};

export default Match;
