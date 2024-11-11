import { React, useState, useEffect, useRef } from "react";
import "./lobby.css";
import Button from "../components/button";
import PlayerList from "../components/lobby.playerlist";
import getUsername from "../utils/getusername";
import PopupName from "../components/popup.name";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import dataService from '../utils/dataservice.js';
import getPlayerObject from '../utils/getplayerobject.js';

/* 
The match Lobby should be where you see the player list and can click SPIEL STARTEN 
*/
const Lobby = (props) => {
	const {matchId} = useParams();
	const { state } = useLocation();
	// localStorage variable to store the playerName
	const lsPlayerName = localStorage.getItem('playerName');
	// We get an array containing the player's last Match and his Id in it. Later on, if they match, the player will be assigned that match and id should they reload
	const lsPlayerId = localStorage.getItem('playerIdArray') || '0-0';
	// playerName is props.playerName so it can be attached when loading the lobby again after a match, if the playerName is unassigned that's when getUsername is called and a name is assigned
	// if state is null, we get lsPlayerName which is the localStorage
	const [playerName, setPlayerName] = useState(state ? state.playerObject.name : null);
	const [showDialog, setShowDialog] = useState(false);
	const [loadedMatch, setLoadedMatch] = useState({playerList: []});
	const [buttonName, setButtonName] = useState("SPIEL STARTEN");
	let oldPlayerName = playerName;
	const navigate = useNavigate();

	//TODO: Popup that asks for the player's name
	useEffect(() => {
		let done = false;
		if (!done) {
		dataService.get(matchId)
			.then((response) => response.json())
			.then((response) => {
				let matchWasModified = false;
				// Local playerName variable so we have an updated value for subsequent ops
				let localPlayerName = playerName;
				console.log(`localPlayerName ${localPlayerName}`);
				let playerObject;
				setLoadedMatch(response);
				// If the localStorage match-id fits with a player in this lobby, assign our playerName to it
				// else if the playerName exists but the match-id doesn't fit, assign a new one
				// else if we don't have any playerName at all, assign a new one
				const localPlayerIdArray = lsPlayerId.split('-');
				const localPlayerId = parseInt(localPlayerIdArray[1]);
				const localPlayerMatch = parseInt(localPlayerIdArray[0]);
				if (((localPlayerMatch === response._id) && (response.playerList.findIndex(element => (element.name === lsPlayerName) && (element.id === localPlayerId)) != -1)) || ((localPlayerMatch != 0) && (response.playerList.findIndex(element => lsPlayerName === element.name) === -1))) {
					localPlayerName = lsPlayerName; 
					setPlayerName(localPlayerName);
				}
				else if (!localPlayerName) {
					localPlayerName = getUsername(response.playerList);
					setPlayerName(localPlayerName);
					localStorage.setItem('playerName', localPlayerName);
				}
				// If there is no playerList present, make own player owner
				if (response.playerList.length === 0) {
					playerObject = {
						id: 0,
						name: localPlayerName,
						isOwner: true,
						wordsCompleted: 0,
						score: 0,
						hasPlayed: false,
					}
					if (response.isOngoing) playerObject.hasPlayed = true;
					// It shouldn't really matter to push to this current playerList our playerObject since that's handled in the backend, but cba to touch anything
					response.playerList.push(playerObject);
					matchWasModified = true;
				} 
				// If there is a playerList and the playerName doesn't appear, add him
				else if ((response.playerList.findIndex(e => e.name === localPlayerName)) === -1) {
					playerObject = {
						name: localPlayerName,
						wordsCompleted: 0,
						score: 0,
						hasPlayed: false,
					}
					if (response.isOngoing) playerObject.hasPlayed = true;
					response.playerList.push(playerObject);
					matchWasModified = true;
				}
				if (matchWasModified) {
					dataService.update(playerObject, response._id)
						.then((response2) => response2.json())
						.then((response) => {
							setLoadedMatch(response);
							console.log(response);
							let localPlayerId = response.playerList.find((a) => a.name === localPlayerName).id;
							localStorage.setItem('playerIdArray', `${response._id}-${localPlayerId}`);

						});
				}
			})
			// On error just send the player to a new match
			.catch((err) => {
				console.log(err);
				navigate(`/`);
			});
		}

		return () => { 
			done = true;
		}
	},[]);

	// useEffect to set up the setInterval every time the playerName changes
	useEffect(() => {
		let finished = false;
		let intervalId;

		if (!finished) {
			intervalId = setInterval(updateMatch, 3000, getPlayerObject);
		}

		return () => {
			finished = true;
			clearInterval(intervalId);
		}
	}, [playerName, loadedMatch]);

	const startMatch = (e) => {
		setButtonName("LADEN...");
		dataService.startMatch(loadedMatch._id)
			.catch(e => console.log(e));
			}
	
	// BROKEN! TODO: Update this function with the correct variable
	const changeUserName = (newUserName) => {
		if (loadedMatch.playerList.length > 0) {
			let newPlayerObject = getPlayerObject(loadedMatch, playerName);
			newPlayerObject.name = newUserName;
			setPlayerName(newUserName);
			localStorage.setItem('playerName', newUserName);
			dataService.update(newPlayerObject, matchId);
			oldPlayerName = newUserName;
		}
	}

	// function to update the match data with the latest one
	const updateMatch = (getPlayerObject) => {
		dataService.get(matchId)
			.then((response) => response.json())
			.then(match => {
				setLoadedMatch(match);
				if (match.isOngoing && !getPlayerObject(match, playerName).hasPlayed) {
					navigate(`/spiel/${match._id}`, { state: { playerObject: getPlayerObject(match, playerName) } });
				}
			})
			.catch(e => console.log(e));
	}

	return (
		<>
			<PopupName
				setUserName={changeUserName}
				showDialog={showDialog}
				setShowDialog={setShowDialog}
				originalName={oldPlayerName}
				playerList={loadedMatch.playerList}
			/>
			<div className="room">
				<div className="playerlist">
					<PlayerList
						playerList={loadedMatch.playerList}
						playerName={playerName}
						setShowDialog={setShowDialog}
					/>
				</div>
				{loadedMatch.playerList.some((e) => e.name === playerName && e.isOwner) && (
					<div className="start-game">
							<Button onClick={startMatch}>{buttonName}</Button>
					</div>
				)}
			</div>
		</>
	);
};

export default Lobby;
