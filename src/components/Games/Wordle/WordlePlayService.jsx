import React, { useState } from 'react';
import { Button, Modal, Form, FloatingLabel } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Wordlelogo from './wordle.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function WordlePlayService() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userData = USER_AUTH_DATA;

    const [show, setShow] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [score, setScore] = useState('');
    const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0, 0]); // Initialize with 6 guesses
    const [gameIsWin, setGameIsWin] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleFormClose = () => setShowForm(false);

    const handleShow = (url) => {
        window.open(url, '_blank');
        setShowForm(true);
        setShow(false);
    };

    const loginUsername = userData.username;
    const loginUserEmail = userData.email;

    const onSubmit = async (event) => {
        event.preventDefault();
        setShowForm(false);

        const currentTime = new Date().toISOString(); // User's current local time
        const createdAt = new Date().toISOString(); // The time the game was completed

        const wordleScore = score.replace(/[🟩🟨⬜]/g, ""); // Remove emojis if present
        const match = wordleScore.match(/(\d+|X)\/(\d+)/);

        if (match) {
            const guessesUsed = parseInt(match[1], 10); // Extract number of guesses used
            const totalGuesses = parseInt(match[2], 10); // Extract total guesses allowed
            const isWin = guessesUsed <= totalGuesses; // Check if the game was won

            // Set the win state
            setGameIsWin(isWin);

            // Update guess distribution based on the number of guesses used
            const updatedGuessDistribution = [...guessDistribution];
            if (isWin && guessesUsed <= 6) {
                updatedGuessDistribution[guessesUsed - 1] += 1;
            }
            setGuessDistribution(updatedGuessDistribution);

            const wordleObject = {
                username: loginUsername,
                useremail: loginUserEmail,
                wordlescore: score,
                guessDistribution: updatedGuessDistribution,
                isWin: isWin,
                createdAt: createdAt, // Time when the score was created
                currentUserTime: currentTime // Pass the current user's time
            };

            try {
                const res = await Axios.post('https://wordle-server-nta6.onrender.com/wordle/wordle-score', wordleObject);

                if (res) {
                    const currentStats = await Axios.get(`https://wordle-server-nta6.onrender.com/wordle-game-stats/${loginUserEmail}`);
                    const currentStreak = currentStats.data.currentStreak || 0;
                    const streak = isWin ? currentStreak + 1 : 0;

                    const TotalGameObject = {
                        username: loginUsername,
                        useremail: loginUserEmail,
                        totalWinGames: isWin ? (currentStats.data.totalWinGames || 0) + 1 : currentStats.data.totalWinGames || 0,
                        lastgameisWin: isWin,
                        currentStreak: streak,
                        guessDistribution: updatedGuessDistribution,
                    };
                    
                    await updateTotalGamesPlayed(TotalGameObject);
                    setScore('');
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'An unexpected error occurred.';
                toast.error(errorMsg, {
                    position: "top-center"
                });
            }
        }
    };

    const updateTotalGamesPlayed = async (TotalGameObject) => {
        try {
            const res = await Axios.post('https://wordle-server-nta6.onrender.com/wordle-game-stats/update', TotalGameObject);
            if (res) {
                // You can add any additional logic here if needed
            }
        } catch (err) {
            console.error('Error updating total games played:', err);
            toast.error('Failed to update total games played', {
                position: "top-center"
            });
        }
    };

    return (
        <>
            <div className="my-3">
                <Button className="wordle-btn px-5" onClick={() => handleShow('https://www.nytimes.com/games/wordle/index.html')}>
                    Play
                </Button>
            </div>
            <Modal show={showForm} onHide={handleFormClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <img className='img-fluid d-block m-auto' alt="wordle-logo" style={{ width: "100px" }} src={Wordlelogo}></img>
                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter Name" value={loginUsername} readOnly />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicScore">
                            <Form.Label>Paste Result</Form.Label>
                            <FloatingLabel controlId="floatingTextarea2" label="">
                                <Form.Control
                                    as="textarea"
                                    value={score}
                                    onChange={(event) => setScore(event.target.value)}
                                    style={{ height: '100px' }}
                                />
                            </FloatingLabel>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleFormClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    );
}

export default WordlePlayService;
