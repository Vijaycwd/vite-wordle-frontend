import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './WordleScores.css';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import WordleScoreByDate from './WordleScoreByDate';
import Wordlestatistics from './Wordlestatistics';
import WordlePlayService from './WordlePlayService';

function Wordlestatechart() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;

    const [statsChart, setStatsChart] = useState([]);
    const [totalGames, setTotalGames] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getStatChart();
    }, []);

    const getStatChart = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await Axios.get('https://wordle-server-nta6.onrender.com/wordle');
            const scoreData = response.data.filter(item => item.useremail === loginuserEmail && isToday(new Date(item.createdAt)));
            const playedGames = response.data.filter(item => item.useremail === loginuserEmail);

            setStatsChart(scoreData);
            setTotalGames(playedGames.length);
        } catch (err) {
            console.error("Error fetching data: ", err);
            setError("Failed to load data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const isToday = (date) => {
        const today = new Date();
        // Get today's date in UTC
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        // Compare with the provided date in UTC
        return date.getUTCFullYear() === todayUTC.getUTCFullYear() &&
               date.getUTCMonth() === todayUTC.getUTCMonth() &&
               date.getUTCDate() === todayUTC.getUTCDate();
    };

    const splitIntoRows = (inputString, rowLength) => {
        const rows = [];
        const charArray = Array.from(inputString); 
        for (let i = 0; i < charArray.length; i += rowLength) {
            rows.push(charArray.slice(i, i + rowLength).join(' '));
        }
        return rows;
    };

    return (
        <Container>
            <Row className='align-items-center justify-content-center'>
                <Col md={12} className='border p-3 shadow rounded'>
                    <Row>
                        <Col md={4} className="m-auto p-3">
                            <h4 className="my-2 font-weight-bold fs-4 text-center">Today's Result</h4>

                            {loading ? (
                                <div className='text-center my-4'>
                                    <p>Loading...</p>
                                </div>
                            ) : error ? (
                                <Alert variant='danger'>{error}</Alert>
                            ) : (
                                statsChart.length > 0 ? (
                                    statschart.map((char, index) => {
                                        const cleanedScore = char.wordlescore.replace(/[🟩🟨⬜]/g, "");
                                        const lettersAndNumbersRemoved = char.wordlescore.replace(/[a-zA-Z0-9,/\\]/g, "");
                                        const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                                        const wordleScores = splitIntoRows(removespace, 5);
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
                                        <WordlePlayService updateStatsChart={getStatChart} />
                                    </div>
                                )
                            )}
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <Wordlestatistics totalGames={totalGames} />
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4} className='text-align-center py-5'>
                            <WordleScoreByDate />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default Wordlestatechart;
