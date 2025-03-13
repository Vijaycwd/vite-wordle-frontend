import React from "react";
import { Modal, Button } from "react-bootstrap";

function GetGroupScore({ showForm, handleFormClose, dayResults, game }) {
    function splitIntoRows(inputString, rowLength) {
        const rows = [];
        const charArray = Array.from(inputString);
        for (let i = 0; i < charArray.length; i += rowLength) {
            rows.push(charArray.slice(i, i + rowLength).join(' '));
        }
        return rows;
    }

    return (
        <Modal show={showForm} onHide={handleFormClose}>
            <Modal.Header closeButton>
                <Modal.Title>{game.charAt(0).toUpperCase() + game.slice(1)} Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {Array.isArray(dayResults) && dayResults.length > 0 ? (
                    dayResults.map((char, index) => {
                        let cleanedScore = "";
                        let wordleScores = [];
                        let connectionsScore = [];
                        let gameScore = ""; // Declare before use

                        if (game === "wordle") {
                            cleanedScore = char.wordlescore?.replace(/[🟩🟨⬜⬛]/g, "") || "";
                            const lettersAndNumbersRemoved = char.wordlescore?.replace(/[a-zA-Z0-9,/\\]/g, "") || "";
                            gameScore = char.gamescore; // Fixed variable name
                            wordleScores = splitIntoRows(lettersAndNumbersRemoved.replace(/\s+/g, ''), 5);
                        } else if (game === "connections") {
                            cleanedScore = char.connectionsscore.replace(/[🟨🟩🟦🟪]/g, "");
                            const lettersAndNumbersRemoved = char.connectionsscore.replace(/[a-zA-Z0-9,#:/\\]/g, "");
                            connectionsScore = splitIntoRows(lettersAndNumbersRemoved.replace(/\s+/g, ''), 4);
                            gameScore = char.gamlescore
                            ; // Fixed variable name
                            console.log(char);
                        } else if (game === "phrazle") {
                            cleanedScore = char.phrazlescore || "No phrazle data";
                        }

                        const createDate = char.createdat;
                        const date = new Date(createDate);
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const todayDate = `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;

                        return (
                            <div key={index}>
                                <h5 className='text-center'>Game Score: {gameScore}</h5>
                                <div className={`wordle-score-board-text my-3 fs-5 text-center`}>{cleanedScore}</div>
                                <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                                {game === "wordle" && (
                                    <pre className='text-center'>
                                        {wordleScores.map((row, rowIndex) => (
                                            <div key={rowIndex}>{row}</div>
                                        ))}
                                    </pre>
                                )}
                                {game === "connections" && (
                                    <pre className='text-center'>
                                        {connectionsScore.map((row, rowIndex) => (
                                            <div key={rowIndex}>{row}</div>
                                        ))}
                                    </pre>    
                                )}
                                {game === "phrazle" && <p className="text-center">Phrazle Result: {cleanedScore}</p>}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center">No results available.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleFormClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default GetGroupScore;
