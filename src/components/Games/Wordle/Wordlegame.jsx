import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal, Form, FloatingLabel } from 'react-bootstrap';
import Axios from "axios";
import { useNavigate } from 'react-router-dom';
import Wordlelogo from './wordle.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Wordlegame = (props) => {

    const [show, setShow] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [score, setScore] = useState('');
    const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0, 0]); // Initialize with 6 guesses
    const [gameisWin, setGameisWin] = useState(false);
    const navigate = useNavigate();

    
    const handleClose = () => setShow(false);
    const handleformClose = () => setShowForm(false);

    // const handleShow = async (event) =>{
    //     window.open(url, '_blank');
    //     setShowForm(true);
    //     setShow(false);
    //     // setModalContent(content);
    //     setShow(true);
    // };

    const handleNavigation = (url) => {
        window.open(url, '_blank');
        setShowForm(true);
        setShow(false);
    };

    const handleWordlestate = async (event) => {
        event.preventDefault();
        navigate('/wordlestats');
    };

    const loginusername = props.loginUserData.username;
    const loginuseremail = props.loginUserData.email;

    const TotalGameObject = {
        username: loginusername,
        useremail: loginuseremail,
        totalWinGames: gameisWin ? 1 : 0,
    }
    
    // console.log(TotalGameObject);
    // console.log(gameisWin);
    const handleFocus = (event) => {
        const deviceDetails = navigator.userAgent;
        if(deviceDetails && deviceDetails.includes("Mobile")) {
            // console.log('true');
            event.preventDefault();
        }
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setShowForm(false);
        const wordlescore = score.replace(/[🟩🟨⬜]/g, ""); // Remove emojis if present
        const match = wordlescore.match(/(\d+|X)\/(\d+)/);
    
        if (match) {
            const guessesUsed = parseInt(match[1], 10); // Extract number of guesses used
            const totalGuesses = parseInt(match[2], 10); // Extract total guesses allowed
            const isWin = guessesUsed <= totalGuesses; // Check if the game was won
            
            // Set the win state and ensure the object is created with the updated state
            setGameisWin(isWin);
            
            const wordleObject = {
                username: loginusername,
                useremail: loginuseremail,
                wordlescore: score,
                guessDistribution: guessDistribution,
                isWin: isWin,
                createdAt: new Date().toISOString(),
            };
    
            try {
                const res = await Axios.post('https://wordle-server-nta6.onrender.com/wordle/wordle-score', wordleObject);
                if (res) {
                    // console.log("created", createWordle);
                    
                    // Create the TotalGameObject after setting the state
                    const currentStats = await Axios.get(`https://wordle-server-nta6.onrender.com/wordle-game-stats/${loginuseremail}`);
                    const currentStreak = currentStats.data.currentStreak || 0;
                    const streak = isWin ? currentStreak + 1 : 0;

                    const TotalGameObject = {
                        username: loginusername,
                        useremail: loginuseremail,
                        totalWinGames: isWin ? (currentStats.data.totalWinGames || 0) + 1 : currentStats.data.totalWinGames || 0,
                        lastgameisWin: isWin,
                        currentStreak: streak,
                    };
                    // console.log(TotalGameObject);
                    await updateTotalGamesPlayed(TotalGameObject); // Pass the updated object
                    
                    setScore('');
                }
            } catch (err) {
                // console.error(err);
                const errorMsg = err.response.data.message;
                toast.error(errorMsg, {
                    position: "top-center"
                });
            }
        }
    };
    
    const updateTotalGamesPlayed = async (TotalGameObject) => {
        try {
            // console.log('Sending request with:', TotalGameObject);
            const res = await Axios.post('https://wordle-server-nta6.onrender.com/wordle-game-stats/update', TotalGameObject);
            if (res) {
                const wordleStats = res.data;
                // console.log("Updated", wordleStats);
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
            <ToastContainer />
            <Row>
                <Col>
                    <div className="my-3">
                        <Button className="wordle-btn px-5"  onClick={() => handleNavigation('https://www.nytimes.com/games/wordle/index.html')}>
                            Play
                        </Button>
                    </div>
                </Col>
                <Col>
                    <div className="my-3">
                        <Button className="wordle-btn px-5" onClick={handleWordlestate}>
                            Stats
                        </Button>
                    </div>
                </Col>
            </Row>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalContent}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <p>Click the “Play” button to go to the Wordle website and play. Then:</p>
                        <ol>
                            <li><b>PLAY:</b> Play Wordle</li>
                            <li><b>COPY:</b> Click SHARE, then COPY to copy your Wordle result</li>
                            <li><b>PASTE:</b> Navigate back to WordGAMLE.com to paste your Wordle result</li>
                        </ol>
                        <Button variant="primary" size="lg" onClick={() => handleNavigation('https://www.nytimes.com/games/wordle/index.html')}>
                            Play
                        </Button>
                    </div> 
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showForm} onHide={handleformClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <img className='img-fluid d-block m-auto' alt="wordle-logo" style={{width:"100px"}} src={Wordlelogo}></img>
                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter Name" value={loginusername} readOnly />
                            <Form.Text className="text-muted"></Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Paste Result</Form.Label>
                            <FloatingLabel controlId="floatingTextarea2" label="">
                                <Form.Control
                                    as="textarea"
                                    value={score}
                                    onFocus={ handleFocus }
                                    onChange={(event) => { setScore(event.target.value); }}
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
                    <Button variant="secondary" onClick={handleformClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Wordlegame;
