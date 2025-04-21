import { useState, useEffect } from 'react';
import Axios from 'axios';
import './ConnectionsScores.css';
import { Container, Row, Col } from 'react-bootstrap';
import Connectionsstatistics from './ConnectionsStatistics';
import ConnectionPlayService from './ConnectionPlayService';
import ConnectionsScoreByDate from './ConnectionsScoreByDate';
import ConnectionsGuessDistribution from './ConnectionsGuessDistribution';

function ConnectionStat() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email; // Optional chaining to avoid errors

    const [statschart, setStatsChart] = useState([]);
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (loginuserEmail) {
            getStatChart();
        }
    }, [loginuserEmail]); // Ensure this depends on loginuserEmail

    function getStatChart() {

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localDate = new Date();
        // Get time zone offset in minutes
        const offsetMinutes = localDate.getTimezoneOffset();  // Offset in minutes (positive for behind UTC, negative for ahead)

        // Now adjust the time by adding the time zone offset (this does not affect UTC, it gives the correct local time)
        const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); // Adjust time by the offset in milliseconds
    
        // Get the adjusted time in 24-hour format, e.g., "2024-12-02T15:10:29.476"
        const todayDate = adjustedDate.toISOString().slice(0, -1);  // "2024-12-02T15:10:29.476" (24-hour format)
        
        Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/connections/get-score.php`, {
            params: { useremail: loginuserEmail, timeZone:timeZone, today: todayDate }
        })
        .then((res) => {
            if (res.data.status === "success") {
                const scoreData = res.data.connectionsscore;
                setStatsChart(scoreData); // Update state with the score data
                setLoading(false); // Set loading to false once data is fetched
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
 console.log(statistics);
    return (
        <Container>
            <Row className='align-items-center justify-content-center'>
                <Col md={12} className='border p-3 shadow rounded'>
                    <Row>
                        <Col md={4} className="m-auto p-3">
                            <div>
                                <h4 className="my-2 font-weight-bold fs-4 text-center pb-3">Today's Result</h4>
                                {loading ? (
                                    <div className='text-center my-4'>
                                        <p>Loading...</p>
                                    </div>
                                ) : (
                                    statschart && Array.isArray(statschart) && statschart.length > 0 ? (
                                        statschart.map((char, index) => {
                                            console.log(char);
                                            const cleanedScore = char.connectionsscore.replace(/[🟨,🟩,🟦,🟪]/g, "");
                                            const lettersAndNumbersRemoved = char.connectionsscore.replace(/[a-zA-Z0-9,#:/\\]/g, "");
                                            const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                                            const connectionsScore = splitIntoRows(removespace, 4);
                                            const createDate = char.createdat; // Ensure this matches your database field name
                                            const date = new Date(createDate);
                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                            const todayDate = `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
                                            const gamleScore = char.gamlescore;
                                            return (
                                                
                                                <div key={index}>
                                                    <h5 className='text-center'>Gamle Score: {gamleScore}</h5>
                                                    {Number(gamleScore) !== 4 && (
                                                        <>
                                                        <div className={`wordle-score-board-text my-3 fs-5 text-center`}>{cleanedScore}</div>
                                                        <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                                                        <pre className='text-center'>
                                                            {connectionsScore.map((row, rowIndex) => (
                                                                <div key={rowIndex}>{row}</div>
                                                            ))}
                                                        </pre>
                                                        </>
                                                    )}
                                                    
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className='text-center my-4'>
                                            <p>You have not played today.</p>
                                            <ConnectionPlayService updateStatsChart={getStatChart}/>
                                        </div>
                                    )
                                )}
                            </div>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <Connectionsstatistics/>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <ConnectionsGuessDistribution/>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4} className='text-align-center py-5'>
                            <ConnectionsScoreByDate/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default ConnectionStat;
