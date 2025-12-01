import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './WordleScores.css';
import { Container, Row, Col } from 'react-bootstrap';

function Wordlestatechart() {
    const userAuthData = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = userAuthData.email;
    const [statschart, setStatsChart] = useState(null);
    const [userEmail, setUserEmail] = useState(loginuserEmail);

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

        Axios.get('https://wordle-server-gf3r.onrender.com/wordle')
        .then((response) => {
            const scoreData = response.data
                .filter(item => item.useremail === userEmail)
                .filter(item => {
                    const itemDate = new Date(item.createdAt); // Change 'timestamp' to your actual date field name
                    return itemDate >= startOfDay && itemDate <= endOfDay;
                });
            setStatsChart(scoreData);
        })
            .catch((error) => {
                console.error("Error fetching data: ", error);
            });
    }

    return (
        <Container>
            <Row className='align-items-center justify-content-center'>
                <Col md={6} className='border p-3 shadow rounded'>
                    <Row>
                        <Col md={4} className="m-auto p-3">
                            <div>
                                <h4 className="my-2 font-weight-bold fs-4">Today's Result</h4>
                                {statschart && Array.isArray(statschart) ? (
                                    statschart.map((char, index) => {
                                        // Processed values
                                        const cleanedScore = char.wordlescore.replace(/[🟩🟨⬜]/g, "");
                                        const lettersAndNumbersRemoved = char.wordlescore.replace(/[a-zA-Z0-9,/\\]/g, "");
                                        // Log the processed values
                                        
                                        return (
                                            <div key={index}>
                                                <div className={`wordle-score-board-text my-3 fs-5`}>{cleanedScore}</div>
                                                <div className={`fs-4 m-auto`}>{lettersAndNumbersRemoved}</div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div>No scores available</div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default Wordlestatechart;
