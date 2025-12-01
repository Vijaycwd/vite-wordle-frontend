import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Axios from 'axios';

function Wordlegroup() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const [memberCount, setMemberCount] = useState(null);
    const [highestPlayedMember, setHighestPlayedMember] = useState(null);
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [currentStreak, setCurrentStreak] = useState('');
    const [maxStreak, setMaxStreak] = useState('');

    useEffect(() => {
        Axios.get(`${baseURL}/games/wordle/get-group-details.php`)
            .then((response) => {
      
                setMemberCount(response.data.member.total_users);
                setHighestPlayedMember(response.data.member.highest_games_played_user);
                setTotalGame(response.data.member.highest_games_played_user.totalGamesPlayed);
                setTotalWin(response.data.member.highest_games_played_user.totalWinGames);
                setCurrentStreak(response.data.member.highest_games_played_user.currentStreak);
                setMaxStreak(response.data.member.highest_games_played_user.maxStreak);
            })
            .catch((error) => {
                console.error("Error fetching member details:", error);
            });
    }, []);

    const winningPercent = Math.round((totalWin / totalGame) * 100);
    const isValidNumber = !isNaN(winningPercent);

    return (
        <Container>
            <Row className="justify-content-center align-items-center">
                <Col sm={6} className="border p-3 shadow rounded text-center">
                    <Row>
                        <h2>Group Members</h2>
                        <div>
                            {memberCount !== null ? (
                                <h5>Total Members: {memberCount}</h5>
                            ) : (
                                <p>Loading member count...</p>
                            )}
                        </div>
                    </Row>
                    <Row className="justify-content-center align-items-center pt-5">
                        <h3 className='pb-3'>Top Ranked</h3>
                        {highestPlayedMember ? (
                                <>
                                <Col sm={4}>
                                    <h4>{highestPlayedMember.username}</h4>
                                </Col >
                                <Col sm={8}>
                                    <div className="statistics">
                                    <h2 className="text-uppercase">Statistics</h2>
                                    <ul>
                                        <li>
                                            <div className="value">{totalGame}</div>
                                            <div className="bottom-text">Total Played</div>
                                        </li>
                                        <li>
                                            <div className="value">
                                                {isValidNumber ? winningPercent : 0}
                                            </div>
                                            <div className="bottom-text">Win %</div>
                                        </li>
                                        <li>
                                            <div className="value">{currentStreak}</div>
                                            <div className="bottom-text">Current Streak</div>
                                        </li>
                                        <li>
                                            <div className="value">{maxStreak}</div>
                                            <div className="bottom-text">Max Streak</div>
                                        </li>
                                    </ul>
                                    </div>
                                </Col >
                                </>
                            ) : (
                                <div>Data Not Found</div>
                            )}
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default Wordlegroup;
