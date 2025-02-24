import { useState, useEffect } from 'react';
import Axios from 'axios';
import './PhrazleScores.css';
import { Container, Row, Col } from 'react-bootstrap';
import Phrazlestatistics from './PhrazleStatistics';
import PhrazlePlayService from './PhrazlePlayService';
import PhrazleScoreByDate from './PhrazleScoreByDate';
import PhrazleGuessDistribution from './PhrazleGuessDistribution';

function PhrazleStat() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email;

    const [statschart, setStatsChart] = useState([]);
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (loginuserEmail) {
            getStatChart();
        }
    }, [loginuserEmail]);

    function getStatChart() {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localDate = new Date();
        const offsetMinutes = localDate.getTimezoneOffset();
        const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000);
        const todayDate = adjustedDate.toISOString().slice(0, -1);

        Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/phrazle/get-score.php`, {
            params: { useremail: loginuserEmail, timeZone, today: todayDate }
        })
        .then((res) => {
            if (res.data.status === "success") {
                setStatsChart(res.data.phrazlescore);
            }
            setLoading(false);
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
    }, [loginuserEmail]);

    function getDisscussion() {
        Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/phrazle/get-guessdistribution.php`, {
            params: { useremail: loginuserEmail }
        })
        .then((res) => {
            if (res.data.status === "success") {
                setStatistics(res.data.guessdistribution);
            }
            setLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching data: ", error);
            setLoading(false);
        });
    }

    function splitIntoRows(text) {
        const cleanedData = text.trim();
        const rows = cleanedData.split(/\n+/);
        return rows.map(row => row.replace(/\s+/g, ' ').trim());
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
                                    <div className='text-center my-4'><p>Loading...</p></div>
                                ) : (
                                    statschart && Array.isArray(statschart) && statschart.length > 0 ? (
                                        (() => {
                                            const amData = statschart.filter((char) => new Date(char.createdat).getHours() < 12);
                                            const pmData = statschart.filter((char) => new Date(char.createdat).getHours() >= 12);
                                            const currentHour = new Date().getHours();

                                            const renderStats = (data, label) => (
                                                <div key={label}>
                                                    {data.length > 0 ? (
                                                        data.map((char, index) => {
                                                            const cleanedScore = char.phrazlescore.replace(/[🟨,🟩,🟦,🟪,⬜]/g, "");
                                                            const phrazle_score_text = cleanedScore.replace(/#phrazle|https:\/\/solitaired.com\/phrazle/g, '');
                                                            const lettersAndNumbersRemoved = char.phrazlescore.replace(/[a-zA-Z0-9,#:./\\]/g, "");
                                                            const phrazleScore = splitIntoRows(lettersAndNumbersRemoved);
                                                            
                                                            const date = new Date(char.createdat);
                                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                            const todayDate = `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
                                                            const gamleScore = char.gamlescore;

                                                            return (
                                                                <div className="text-center pb-2" key={index}>
                                                                    <h4 className="text-center my-3">{label} Data</h4>
                                                                    <h5 className='text-center'>Gamle Score: {gamleScore}</h5>
                                                                    <div className="phrazle-score-board-text my-3 fs-5 text-center">{phrazle_score_text}</div>
                                                                    <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                                                                    <div className="phrazle-score m-auto text-center">
                                                                        {phrazleScore.map((row, rowIndex) => (
                                                                            row.trim() && (
                                                                                <div className="phrasle-row-score" key={rowIndex}>
                                                                                    {row.split(' ').map((part, partIndex) => (
                                                                                        <div className="row" key={partIndex}>
                                                                                            {part.split(' ').map((symbol, symbolIndex) => (
                                                                                                <div className="items" key={symbolIndex}>{symbol}</div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className='text-center'>
                                                                 {label === "AM" && currentHour < 12 && (
                                                                    <>
                                                                         <p>You have not played today.</p>
                                                                         <PhrazlePlayService updateStatsChart={getStatChart}/>
                                                                    </>
                                                                )}

                                                                {label === "PM" && currentHour >= 12 && (
                                                                    <>
                                                                        <p>You have not played Phrazle PM game today.</p>
                                                                        <PhrazlePlayService updateStatsChart={getStatChart}/>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            );

                                            return (
                                                <>
                                                    {renderStats(amData, "AM")}
                                                    {renderStats(pmData, "PM")}
                                                </>
                                            );
                                        })()
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
                        <Col md={4}><Phrazlestatistics/></Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}><PhrazleGuessDistribution/></Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4} className='text-align-center py-5'><PhrazleScoreByDate/></Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default PhrazleStat;
