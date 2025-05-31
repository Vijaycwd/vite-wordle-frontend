import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Row, Col, ProgressBar, Modal, Button } from "react-bootstrap";
import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import WordlePlayService from '../../components/Games/Wordle/WordlePlayService';
import ConnectionPlayService from '../../components/Games/Connections/ConnectionPlayService';
import PhrazlePlayService from '../../components/Games/Phrazle/PhrazlePlayService';

function GroupLeaderboardScores({ setLatestJoinDate, setSelectedMember, setShowProfile }) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const { id, groupName, game } = useParams();
    const [todayLeaderboard, setTodayLeaderboard] = useState([]);
    const [cumulativeScore, setCumulativeScore] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scoringmethod, setScoringMethod] = useState("");
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    
    const userId = USER_AUTH_DATA?.id;
    const userName = USER_AUTH_DATA?.username;
    const userEmail = USER_AUTH_DATA?.email;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = new Date();
    const offsetMinutes = localDate.getTimezoneOffset();
    const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000);
    const todayDate = adjustedDate.toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const yesterdayDate = new Date(adjustedDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const formattedYesterday = yesterdayDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const [dayResults, setDayResults] = useState(null);
    const [selectedGame, setSelectedGame] = useState("");
    const [showModal, setShowModal] = useState(false);
    // useEffect(() => {
    //     // Call the auto-submit PHP script
    //     axios.get(`${baseURL}/games/wordle/auto-submit-wordle-scores.php`, {
    //         params: { timeZone, formattedYesterday}
    //     })
    //       .then(res => {
    //         //// console.log('Phrazle auto-submit success:', res.data);
    //       })
    //       .catch(err => {
    //         //console.error('Phrazle auto-submit failed:', err);
    //       });
    //   }, []);
      
    useEffect(() => {
        const fetchScoringMethod = async () => {
            try {
                const res = await axios.get(`${baseURL}/groups/get-scoring-method.php`, {
                    params: { user_id: userId, group_id: id }
                });

                // console.log("Fetched Scoring Method:", res.data.scoring_method);

                if (res.data.status === "success") {
                    setScoringMethod(res.data.scoring_method || ""); // Default to empty string
                } else {
                    toast.error("Scoring Method not found.");
                }
            } catch (err) {
                toast.error("Failed to load group info.");
            }
        };

        if (id && userId) {  
            fetchScoringMethod();
        }
    }, [id, userId]); 
    

    useEffect(() => {
        const fetchGroupStats = async () => {
            if (!id || !game) return;

            try {
                setLoading(true);

                // Fetch Today's Scores
                const todayResponse = await axios.get(`${baseURL}/groups/get-group-score.php`, {
                    params: { groupId: id, groupName, game, timeZone, today: todayDate }
                });

                // console.log("Today's Scores Response:", todayResponse.data);

                setTodayLeaderboard(todayResponse.data.data || []);
            } catch (error) {
                console.error("Error fetching group stats:", error.response ? error.response.data : error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupStats();
    }, [id, groupName, game, todayDate]);

    const getCurrentPeriod = () => {
    const hours = new Date().getHours();
    return hours < 12 ? 'AM' : 'PM';
    };
    
    const period = game === 'phrazle' ? getCurrentPeriod() : null;


    useEffect(() => {
        const fetchGroupStats = async () => {
            if (!id || !game) return;
    
            try {
                setLoading(true);
    
                const params = {
                    groupId: id,
                    groupName,
                    game,
                    timeZone,
                    today: todayDate,
                };
    
                // If the game is Phrazle, include the period
                if (game === 'phrazle') {
                    params.period = period; // 'AM' or 'PM'
                }
    
                const todayResponse = await axios.get(
                    `${baseURL}/groups/get-group-score.php`,
                    { params }
                );
    
                setTodayLeaderboard(todayResponse.data.data || []);
            } catch (error) {
                console.error("Error fetching group stats:", error.response ? error.response.data : error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchGroupStats();
    }, [id, groupName, game, todayDate, period]);
    

    useEffect(() => {
        const fetchCumulativeScore = async () => {
            if (!id || !game) return;

            try {
                setLoading(true);

                // Fetch Cumulative Scores
                const cumulativeResponse = await axios.get(`${baseURL}/groups/get-cumulative-score.php`, {
                    params: { groupId: id, groupName, game, timeZone }
                });
                console.log(cumulativeResponse.data.latestJoinDate);
                setLatestJoinDate(cumulativeResponse.data.latestJoinDate || []);
                setCumulativeScore(cumulativeResponse.data.data || []);
            } catch (error) {
                console.error("Error fetching cumulative stats:", error.response ? error.response.data : error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCumulativeScore();
    }, [id, groupName, game]);

    

    // Function to get the max possible score for a game
    const getTotalScore = (gameName) => {
        const cleanedName = gameName ? gameName.trim().toLowerCase() : "";
        return cleanedName === "wordle" ? 7 :
               cleanedName === "connections" ? 4 :
               cleanedName === "phrazle" ? 7 :
               1; // Default to 1 if unknown
    };

    const handleShowProfile = (data) => {
        setSelectedMember(data);
        setShowProfile(true);
    };
    const showDayResult = (date, useremail, game) => {
    // console.log('showDayResult');
    setSelectedGame(game);
    const timeZone = moment.tz.guess();
    axios.get(`${baseURL}/games/${game}/get-score.php`, {
        params: { useremail, timeZone, today: date }
    })
    .then((response) => {
        let scoreData = [];

        // Assign correct data based on game type
        if (game === "wordle") {
            scoreData = response.data?.wordlescore || [];
        } else if (game === "connections") {
            scoreData = response.data?.connectionsscore || [];
            
        } else if (game === "phrazle") {
            scoreData = response.data?.phrazlescore || [];
        }

        setDayResults(scoreData);
        setShowModal(true);
    })
    .catch((error) => {
        console.error(`API Error for ${game}:`, error);
    });
};


const handleCloseModal = () => {
    setShowModal(false);
    // if (updated) fetchGroupInfo();
};
function splitIntoRowsByNewline(text) {
    const cleanedData = text.trim();
    const rows = cleanedData.split(/\n+/);
    return rows.map(row => row.replace(/\s+/g, ' ').trim());
}
function splitIntoRowsByLength(inputString, rowLength) {
    const rows = [];
    const charArray = Array.from(inputString); // Convert string to array of characters
    for (let i = 0; i < charArray.length; i += rowLength) {
        rows.push(charArray.slice(i, i + rowLength).join(' '));
    }
    return rows;
}
const noDataMessage = {
  wordle: "Gamle Score 7",
  connections: "Gamle Score 4",
  phrazle: "Gamle Score 7"
}[game] || "No data available.";
    //// console.log('todayLeaderboard',todayLeaderboard);
    return (
        <div>
            
            {loading && <p>Loading scores...</p>}
            {error && <p className="text-danger">{error}</p>}

            {/* <h6 className="py-3">Scoring Method: {scoringmethod}</h6> */}
            
            
            
            {!loading && !error && (

                <Row className="justify-content-center leaderboard">
                    <Col md={4}>
                   
                    {todayLeaderboard.length > 0 ? (
                        <>
                            {/* Separate Phrazle AM and PM */}
                        

                            {!loading && !error && todayLeaderboard.length > 0 && (() => {
                                // Filter out "phrazle" and find the lowest score
                                const filteredLeaderboard = todayLeaderboard.filter((data) => data.gamename === "phrazle");
                                //// console.log('filteredLeaderboard',filteredLeaderboard);
                                if (filteredLeaderboard.length === 0) return null;

                                const minScore = Math.min(...filteredLeaderboard.map(data => Number(data.gamlescore)));

                                // Find all players with the lowest score
                                const winners = filteredLeaderboard.filter(data => Number(data.gamlescore) === minScore);
                                const missedUsers = filteredLeaderboard
                                    .filter(d => d?.missed && String(d?.is_paused) === "0")
                                    .map(d => ({
                                        name: d.username,
                                        email: d.useremail
                                    }));
                                
                                console.log('missedUsers',missedUsers);
                                
                                if (missedUsers.length > 0) {
                                    return (
                                        <div className="text-center mb-3 missed-user-section py-3 px-2">
                                            <h4 className="text-center">Today's Leaderboard</h4>
                                            <p>The Leaderboard will be viewable when all group members have played.</p>
                                            <p className="mb-1">Yet to play:</p>
                                            {missedUsers.map((user, i) => (
                                            <div key={i} className="fw-bold">
                                                {user.email === userEmail ? "You" : user.name}
                                            </div>
                                            ))}

                                            {missedUsers.some(user => user.email === userEmail) && (
                                            <PhrazlePlayService />
                                            )}
                                        </div>
                                    );
                                }
                                else{
                                    
                                    return (
                                        
                                        <>
                                            <h4 className="text-center py-3">Today's Leaderboard</h4>
                                            {filteredLeaderboard
                                                .slice()
                                                .sort((a, b) => a.gamlescore - b.gamlescore)
                                                .map((data, index) => {
                                                    const totalScore = getTotalScore(data.gamename);
                                                    const progressValue =
                                                        totalScore > 0
                                                            ? data.gamename === "connections"
                                                                ? (data.gamlescore / totalScore) * 100
                                                                : ((totalScore - data.gamlescore) / (totalScore - 1)) * 100
                                                            : 0;
    
                                                    // Check if the user is a winner
                                                    const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                                    const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);
    
                                                    // Assign points based on scoring method
                                                    const worldCupScore = isSingleWinner ? 3 : isSharedWinner ? 1 : 0;
                                                    const pesceScore = isSingleWinner ? 1 : isSharedWinner ? 1 : 0; // Pesce: all lowest get 1
    
                                                    return (
                                                        <>
                                                        
                                                        <Row 
                                                            key={index} 
                                                            className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                                        >
                                                            
                                                            {/* Rank + Avatar */}
                                                            <Col xs={3} className="d-flex align-items-center gap-2">
                                                                <div onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                                    <img
                                                                        src={
                                                                        data.avatar
                                                                            ? `${baseURL}/user/uploads/${data.avatar}`
                                                                            : `${baseURL}/user/uploads/defalut_avatar.png`
                                                                        }
                                                                        alt="Profile"
                                                                        className="rounded-circle mb-1"
                                                                        style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                                                    />
                                                                </div>
                                                                {/* <img 
                                                                    src={data.avatar ? `${baseURL}/user/uploads/${data.avatar}` : `${baseURL}/user/uploads/defalut_avatar.png`} 
                                                                    alt="Avatar" 
                                                                    className="rounded-circle border" 
                                                                    style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                                                /> */}
                                                            </Col>
    
                                                            {/* Username */}
                                                            <Col xs={4} className="text-start fw-semibold" onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                                {data.username}
                                                            </Col>
    
                                                            {/* Score & Progress */}
                                                            <Col xs={5}>
                                                                <Row className="align-items-center">
                                                                    <Col xs={7}>
                                                                        <ProgressBar 
                                                                            className={`${data.gamename}-progressbar`} 
                                                                            variant="success" 
                                                                            now={
                                                                                scoringmethod === "Golf"
                                                                                    ? data.gamlescore
                                                                                    : scoringmethod === "World Cup"
                                                                                    ? worldCupScore
                                                                                    : scoringmethod === "Pesce"
                                                                                    ? pesceScore
                                                                                    : data.gamlescore
                                                                            } 
                                                                            max={totalScore} 
                                                                            style={{ height: '8px' }}
                                                                        />
                                                                    </Col>
                                                                    <Col xs={5} className="text-center d-flex fw-bold">
                                                                        {scoringmethod === "Golf" ? (
                                                                            <> {data.gamlescore} {isSingleWinner && "🏆"} </>
                                                                        ) : scoringmethod === "World Cup" ? (
                                                                            <>  {worldCupScore} {isSingleWinner && "🏆"} </>
                                                                        ) : scoringmethod === "Pesce" ? (
                                                                            <> {pesceScore} {isSingleWinner && "🏆"} </>
                                                                        ) : (
                                                                            <> {data.gamlescore} {isSingleWinner && "🏆"} </>
                                                                        )}
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                        </>
                                                    );
                                                })}
                                        </>
                                    );
                                }
                                
                            })()}
                           
                            {!loading && !error && todayLeaderboard.length > 0 && (() => {
                                // Filter out "phrazle" and find the lowest score
                                const filteredLeaderboard = todayLeaderboard.filter((data) => data.gamename !== "phrazle");
                                console.log('filteredLeaderboard',filteredLeaderboard);
                                if (filteredLeaderboard.length === 0) return null;

                                const minScore = Math.min(...filteredLeaderboard.map(data => Number(data.gamlescore)));

                                // Find all players with the lowest score
                                const winners = filteredLeaderboard.filter(data => Number(data.gamlescore) === minScore);
                                const missedUsers = filteredLeaderboard
                                    .filter(d => d?.missed && String(d?.is_paused) === "0")
                                    .map(d => ({
                                        name: d.username,
                                        email: d.useremail
                                    }));
                                if (missedUsers.length > 0) {
                                    const currentUserData = filteredLeaderboard.find(d => d.username === userName);
                                    return (
                                        <div className="text-center mb-3 missed-user-section py-3 px-2">
                                            <h4 className="text-center">Today's Leaderboard</h4>
                                            <p>The Leaderboard will be viewable when all group members have played.</p>
                                            <p className="mb-1">Yet to play:</p>
                                            {missedUsers.map((user, i) => (
                                                <div key={i} className="fw-bold">
                                                    {user.email === userEmail ? "You" : user.name}
                                                </div>
                                            ))}
                                            {missedUsers.some(user => user.email === userEmail) && currentUserData && (
                                                currentUserData.gamename === 'connections' ? (
                                                    <ConnectionPlayService />
                                                ) : currentUserData.gamename === 'wordle' ? (
                                                    <WordlePlayService />
                                                ) : null
                                            )}
                                        </div>
                                    );
                                }
                                else{
                                    return (
                                        
                                        <>
                                            <h4 className="text-center py-3">Today's Leaderboard</h4>
                                            {filteredLeaderboard
                                                .slice()
                                                .sort((a, b) => a.gamlescore - b.gamlescore)
                                                .map((data, index) => {
                                                    const totalScore = getTotalScore(data.gamename);
                                                    const progressValue =
                                                        totalScore > 0
                                                            ? data.gamename === "connections"
                                                                ? (data.gamlescore / totalScore) * 100
                                                                : ((totalScore - data.gamlescore) / (totalScore - 1)) * 100
                                                            : 0;
    
                                                    // Check if the user is a winner
                                                    const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                                    const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);
    
                                                    // Assign points based on scoring method
                                                    const worldCupScore = isSingleWinner ? 3 : isSharedWinner ? 1 : 0;
                                                    const pesceScore = isSingleWinner ? 1 : isSharedWinner ? 1 : 0; // Pesce: all lowest get 1
    
                                                    return (
                                                        <>
                                                        
                                                        <Row 
                                                            key={index} 
                                                            className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                                        >
                                                            
                                                            {/* Rank + Avatar */}
                                                            <Col xs={3} className="d-flex align-items-center gap-2">
                                                                <div onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                                    <img
                                                                        src={
                                                                        data.avatar
                                                                            ? `${baseURL}/user/uploads/${data.avatar}`
                                                                            : `${baseURL}/user/uploads/defalut_avatar.png`
                                                                        }
                                                                        alt="Profile"
                                                                        className="rounded-circle mb-1"
                                                                        style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                                                    />
                                                                </div>
                                                                {/* <img 
                                                                    src={data.avatar ? `${baseURL}/user/uploads/${data.avatar}` : `${baseURL}/user/uploads/defalut_avatar.png`} 
                                                                    alt="Avatar" 
                                                                    className="rounded-circle border" 
                                                                    style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                                                /> */}
                                                            </Col>
    
                                                            {/* Username */}
                                                            <Col xs={4} className="text-start fw-semibold" onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                                {data.username}
                                                            </Col>
    
                                                            {/* Score & Progress */}
                                                            <Col xs={5}>
                                                                <Row className="align-items-center">
                                                                    <Col xs={7}>
                                                                        <ProgressBar 
                                                                            className={`${data.gamename}-progressbar`} 
                                                                            variant="success" 
                                                                            now={
                                                                                scoringmethod === "Golf"
                                                                                    ? data.gamlescore
                                                                                    : scoringmethod === "World Cup"
                                                                                    ? worldCupScore
                                                                                    : scoringmethod === "Pesce"
                                                                                    ? pesceScore
                                                                                    : data.gamlescore
                                                                            } 
                                                                            max={totalScore} 
                                                                            style={{ height: '8px' }}
                                                                        />
                                                                    </Col>
                                                                    <Col xs={5} className="text-center d-flex fw-bold">
                                                                    <span 
                                                                     onClick={() => showDayResult(data.createdat, data.useremail, data.gamename)}
                                                                style={{ cursor: "pointer" }}
                                                                >
                                                                        {scoringmethod === "Golf" ? (
                                                                            <> {data.gamlescore} {isSingleWinner && "🏆"} </>
                                                                        ) : scoringmethod === "World Cup" ? (
                                                                            <>  {worldCupScore} {isSingleWinner && "🏆"} </>
                                                                        ) : scoringmethod === "Pesce" ? (
                                                                            <> {pesceScore} {isSingleWinner && "🏆"} </>
                                                                        ) : (
                                                                            <> {data.gamlescore} {isSingleWinner && "🏆"} </>
                                                                        )}
                                                                        </span>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                        </>
                                                    );
                                                })}
                                        </>
                                    );
                                }
                                
                            })()}
                        </>
                    ) : (
                        <p className="text-center">No scores found today.</p>
                    )}
                    </Col>
                </Row>
            )}

           
            {/* Cumulative Leaderboard */}
            
                    {/*cumulativeScore &&
                    cumulativeScore.length > 0 &&
                    cumulativeScore.some(data => data.gamlescore !== undefined && !isNaN(Number(data.gamlescore)) && data.username) ? (
                        <>
                        <Row className="justify-content-center leaderboard mt-4">
                            <Col md={6} lg={5}>
                            
                            <h4 className="py-3 text-center">
                                Cumulative Leaderboard as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </h4>
                            {latestJoinDate && (
                            <p className="text-center">
                                Latest user join date: {(() => {
                                const [year, month, day] = latestJoinDate.split(' ')[0].split('-');
                                return `${day}-${month}-${year}`;
                                })()}
                            </p>
                            )}
                            {(() => {
                                
                                const minScore = Math.min(...cumulativeScore.map(data => Number(data.gamlescore)));
                                const winners = cumulativeScore.filter(data => Number(data.gamlescore) === minScore);

                                return cumulativeScore
                                    .slice()
                                    .sort((a, b) => a.gamlescore - b.gamlescore)
                                    .map((data, index) => {
                                        const totalScore = getTotalScore(data.gamename);
                                        const incrementScore = (index + 1) * totalScore;

                                        const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                        const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);

                                        const worldCupScore = isSingleWinner ? 3 : isSharedWinner ? 1 : 0;
                                        const pesceScore = isSharedWinner ? 1 : 0;
                                       
                                        return (
                                            <>
                                            <Row
                                                key={index}
                                                className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                            >
                                                <Col xs={3} className="d-flex align-items-center gap-2">
                                                    <img
                                                        src={
                                                            data.avatar
                                                                ? `${baseURL}/user/uploads/${data.avatar}`
                                                                : `${baseURL}/user/uploads/default_avatar.png`
                                                        }
                                                        alt="Avatar"
                                                        className="rounded-circle border"
                                                        style={{ width: "35px", height: "35px", objectFit: "cover" }}
                                                    />
                                                </Col>

                                                <Col xs={4} className="text-start fw-semibold">
                                                    {data.username}
                                                </Col>

                                                <Col xs={5}>
                                                    <Row className="align-items-center">
                                                        <Col xs={9}>
                                                            <ProgressBar
                                                                className={`${data.gamename}-progressbar`}
                                                                variant="success"
                                                                now={data.gamlescore}
                                                                max={data.totalGamesPlayed * totalScore}
                                                                style={{ height: "8px" }}
                                                            />
                                                        </Col>
                                                        <Col xs={3} className="text-center fw-bold">
                                                            {data.gamlescore}
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            
                                            </>
                                        );
                                    });
                            })()}
                            </Col>
                            </Row>
                        </>
                    ) : (
                        <div className="text-center text-muted py-4">No data found</div>
                    )*/}
                
        <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Day Result</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {dayResults && dayResults.length > 0 ? (
                dayResults.map((item, index) => {
                    const date = new Date(item.createdat);
                    const todayDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    });

                    // Example: You must have something to identify game type
                    // Could be item.gametype or you pass a prop 'gameType'
                    // For now, assume `item.gameType` holds 'phrazle', 'wordle', or 'connection'
                    const gameType = item.gameType || 'phrazle'; // default phrazle

                    if (game === 'phrazle') {
                    // For phrazle, remove colored squares and tags
                    const cleanedScore = item.phrazlescore.replace(/[🟨,🟩,🟦,🟪,⬜]/g, "");
                        const phrazle_score_text = cleanedScore.replace(/#phrazle|https:\/\/solitaired.com\/phrazle/g, '');
                        const lettersAndNumbersRemoved = item.phrazlescore.replace(/[a-zA-Z0-9,#:./\\]/g, "");
                        const phrazleScore = splitIntoRowsByNewline(lettersAndNumbersRemoved);
                        const gamleScore = item.gamlescore;

                    return (
                            <div className="text-center pb-2" key={index}>
                            
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
                    } 
                    else if (game === 'wordle') {
                    // Example Wordle display - customize as needed
                    const cleanedScore = item.wordlescore.replace(/[🟩🟨⬜⬛]/g, "");
                    const scoreParts = cleanedScore.split(" ");
                    const lettersAndNumbersRemoved = item.wordlescore.replace(/[a-zA-Z0-9,/\\]/g, "");
                    const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                    const wordleScores = splitIntoRowsByLength(removespace, 5);
                    const createDate = item.createdat;
                    const gamleScore = item.gamlescore;
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
                    } 
                    else if (game === 'connections') {
                    // Example Connection game display
                    const cleanedScore = item.connectionsscore.replace(/[🟨,🟩,🟦,🟪]/g, "");
                    const lettersAndNumbersRemoved = item.connectionsscore.replace(/[a-zA-Z0-9,#:/\\]/g, "");
                    const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                    const connectionsScore = splitIntoRowsByLength(removespace, 4);
                    const createDate = item.createdat; // Ensure this matches your database field name
                    const gamleScore = item.gamlescore;

                    return (
                        <div key={index}>
                            <h5 className='text-center'>Gamle Score: {gamleScore}</h5>
                            <>
                            <div className={`wordle-score-board-text my-3 fs-5 text-center`}>{cleanedScore}</div>
                            <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                            <pre className='text-center'>
                                {connectionsScore.map((row, rowIndex) => (
                                    <div key={rowIndex}>{row}</div>
                                ))}
                            </pre>
                            </>                 
                        </div>
                    );
                    }
                    else {
                    return (
                        <div key={index} className="text-center pb-2">
                        <h5>Unknown Game Type</h5>
                        </div>
                    );
                    }
                })
                ) : (
                        <h5 className='text-center'>{noDataMessage}</h5>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                Close
                </Button>
            </Modal.Footer>
            </Modal>

        </div>
        
    );
}

export default GroupLeaderboardScores;
