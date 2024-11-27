import { useState, useEffect } from 'react';
import Axios from 'axios';
import './PhrazleScores.css';
import { Container, Row, Col } from 'react-bootstrap';
import Phrazlestatistics from './PhrazleStatistics';
import PhrazlePlayService from './PhrazlePlayService';
import PhrazleScoreByDate from './PhrazleScoreByDate';
import PhrazleGuessDistribution from './PhrazleGuessDistribution';

function Phrazletat() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email; // Optional chaining to avoid errors

    const [statschart, setStatsChart] = useState([]);
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [GameScore, setGameScore] = useState();

    useEffect(() => {
        if (loginuserEmail) {
            getStatChart();
        }
    }, [loginuserEmail]); // Ensure this depends on loginuserEmail

    function getStatChart() {

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/phrazle/get-score.php`, {
            params: { useremail: loginuserEmail}
        })
        .then((res) => {
            if (res.data.status === "success") {
                const scoreData = res.data.phrazlescore;
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

    useEffect(() => {
        if (loginuserEmail) {
            getDisscussion();
        }
    }, [loginuserEmail]); // Ensure this depends on loginuserEmail

    function getDisscussion() {

        Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/phrazle/get-guessdistribution.php`, {
            params: { useremail: loginuserEmail}
        })
        .then((res) => {
            if (res.data.status === "success") {
                const scoreData = res.data.guessdistribution;
                setStatistics(scoreData);
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
    function splitIntoRows(text) {
        return text.split(/\r\s*\r/);
    }
    return (
        <Container>
            <Row className='align-items-center justify-content-center'>
                <Col md={12} className='border p-3 shadow rounded'>
                    <Row>
                        <Col md={6} className="m-auto p-3">
                            <div>
                                <h4 className="my-2 font-weight-bold fs-4 text-center">Today's Result</h4>
                                {loading ? (
                                    <div className='text-center my-4'>
                                        <p>Loading...</p>
                                    </div>
                                ) : (
                                    statschart && Array.isArray(statschart) && statschart.length > 0 ? (
                                        statschart.map((char, index) => {
                                            const cleanedScore = char.phrazlescore.replace(/[🟨,🟩,🟦,🟪,⬜]/g, "");
                                            const phrasle_score_text = cleanedScore.replace(/#phrazle|https:\/\/solitaired.com\/phrazle/g, '');
                                            const lettersAndNumbersRemoved = char.phrazlescore.replace(/[a-zA-Z0-9,#:./\\]/g, "");
                                            const phrazleScore = splitIntoRows(lettersAndNumbersRemoved);
                                            // const phrazleScore = splitIntoRows(removespace, 10);
                                            const createDate = char.createdat; // Ensure this matches your database field name
                                            const date = new Date(createDate);
                                            const todayDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                                            const gamleScore = char.gamlescore;
                                            return (
                                                <div key={index}>
                                                    <h5 className='text-center'>Game Score: {gamleScore}</h5>
                                                    <div className={`phrazle-score-board-text my-3 fs-5 text-center`}>{phrasle_score_text}</div>
                                                    <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                                                    <div className='phrazle-score m-auto text-center'>
                                                        {phrazleScore.map((row, rowIndex) => (
                                                            <div className="phrasle-row-score" key={rowIndex}>{row}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className='text-center my-4'>
                                            <p>You have not played today.</p>
                                            <PhrazlePlayService updateStatsChart={getStatChart}/>
                                        </div>
                                    )
                                )}
                            </div>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <Phrazlestatistics/>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <PhrazleGuessDistribution/>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4} className='text-align-center py-5'>
                            <PhrazleScoreByDate/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default Phrazletat;
