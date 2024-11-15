import { useState, useEffect } from 'react';
import Axios from 'axios';
import './WordleScores.css';
import { Container, Row, Col } from 'react-bootstrap';
import WordleScoreByDate from './WordleScoreByDate';
import Wordlestatistics from './Wordlestatistics';
import WordlePlayService from './WordlePlayService';
import WordleGuessDistribution from './WordleGuessDistribution';

function Wordlestatechart() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;

    const [statschart, setStatsChart] = useState([]);
    const [statistics, setStatistics] = useState([]);
    const [totalGame, setTotalGame] = useState('');
    const [loading, setLoading] = useState(true);
    const [gameScore, setGameScore] = useState();

    useEffect(() => {
        // Reset state on component mount
        setStatsChart([]); // Clear previous scores
        setLoading(true);
        getStatChart(); // Fetch scores
    }, [loginuserEmail]); // Run effect when loginuserEmail changes

    function getStatChart() {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/wordle/get-score.php`, {
            params: {
                useremail: loginuserEmail
            }
        })
        .then((response) => {
            if (response.data.status === "success") {
                const scoreData = response.data.wordlescore;
                setLoading(false);
                setStatsChart(scoreData); // Update the score chart with fetched data
                setTotalGame(scoreData.length); // Assuming you want to store the total count of scores
            } else {
                setLoading(false);
            }
        })
        .catch((error) => {
            console.error("Error fetching data: ", error);
            setLoading(false);
        });
    }
    // Function to slice the string into rows of a specified length
    function splitIntoRows(inputString, rowLength) {
        const rows = [];
        const charArray = Array.from(inputString); // Convert string to array of characters
        for (let i = 0; i < charArray.length; i += rowLength) {
            rows.push(charArray.slice(i, i + rowLength).join(' '));
        }
        return rows;
    }
    return (
        <Container>
            <Row className='align-items-center justify-content-center'>
                <Col md={12} className='border p-3 shadow rounded'>
                    <Row>
                        <Col md={4} className="m-auto p-3">
                            <div>
                                <h4 className="my-2 font-weight-bold fs-4 text-center">Today's Result</h4>
                                
                                {loading ? (
                                    <div className='text-center my-4'>
                                        <p>Loading...</p>
                                    </div>
                                ) : (
                                    statschart && Array.isArray(statschart) && statschart.length > 0 ? (
                                        statschart.map((char, index) => {
                                            const cleanedScore = char.wordlescore.replace(/[🟩🟨⬜]/g, "");
                                            const scoreParts = cleanedScore.split(" ");
                                            const attempts = scoreParts[2].split("/")[0];
                                            const lettersAndNumbersRemoved = char.wordlescore.replace(/[a-zA-Z0-9,/\\]/g, "");
                                            const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                                            const wordleScores = splitIntoRows(removespace, 5);
                                            const createDate = char.createdat; // Make sure this matches your database field name
                                            const date = new Date(createDate);
                                            const todayDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                                            const gamleScore = char.gamlescore;
                                            return (
                                                <div key={index}>
                                                    <h5 className='text-center'>Gamle Score: {gamleScore}</h5>
                                                    <div className={`wordle-score-board-text my-3 fs-5 text-center`}>{cleanedScore}</div>
                                                    <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                                                    <pre className='text-center'>
                                                        {wordleScores.map((row, rowIndex) => (
                                                            <div key={rowIndex}>{row}</div>
                                                        ))}
                                                    </pre>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className='text-center my-4'>
                                            <p>You have not played today.</p>
                                            <WordlePlayService
                                                updateStatsChart={getStatChart}
                                               
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <Wordlestatistics/>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <WordleGuessDistribution/>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4} className='text-align-center py-5'>
                            <WordleScoreByDate/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default Wordlestatechart;
