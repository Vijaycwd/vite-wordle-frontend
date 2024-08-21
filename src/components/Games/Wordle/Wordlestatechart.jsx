import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './WordleScores.css';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import WordleScoreByDate from './WordleScoreByDate';
import Wordlestatistics from './Wordlestatistics';
import { USER_AUTH_DATA } from '../../../constant/constants';

function Wordlestatechart() {
    
    const loginuserEmail = USER_AUTH_DATA.email;
    const [statschart, setStatsChart] = useState([]);
    const [userEmail, setUserEmail] = useState(loginuserEmail);
    const [totalGame, setTotalGame] = useState('');

    useEffect(() => {
        if (userEmail) {
            getStatChart();
        }
    }, [userEmail]);

    function getStatChart() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        Axios.get('http://localhost:5001/wordle')
            .then((response) => {
                const scoreData = response.data
                    .filter(item => item.useremail === userEmail)
                    .filter(item => {
                        const itemDate = new Date(item.createdAt); // Change 'timestamp' to your actual date field name
                        return itemDate >= startOfDay && itemDate <= endOfDay;
                    });
                const PlayedGame = response.data.filter(item => item.useremail === userEmail);
                setStatsChart(scoreData);
                setTotalGame(PlayedGame.length);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
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
                                {statschart && Array.isArray(statschart) && statschart.length > 0 ? (
                                    statschart.map((char, index) => {
                                        // Processed values
                                        const cleanedScore = char.wordlescore.replace(/[🟩🟨⬜]/g, "");
                                        const lettersAndNumbersRemoved = char.wordlescore.replace(/[a-zA-Z0-9,/\\]/g, "");
                                        const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                                        const wordleScores = splitIntoRows(removespace, 5);
                                        const guess = char.guessdistribution;
                                        const totalWins = statschart.reduce((total, char) => {
                                            const guess = char.guessdistribution;
                                            return total + guess.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
                                        }, 0);
                                        return (
                                            <div key={index}>
                                                <div className={`wordle-score-board-text my-3 fs-5 text-center`}>{cleanedScore}</div>
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
                                        <Link className='btn btn-primary wordle-btn'  to="/wordle">Play Now</Link>
                                    </div>
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
