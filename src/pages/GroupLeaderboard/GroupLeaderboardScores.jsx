import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Row, Col, ProgressBar } from "react-bootstrap";

function GroupLeaderboardScores() {
    const { id, groupName, game } = useParams();

    const [todayLeaderboard, setTodayLeaderboard] = useState([]);
    const [allLeaderboard, setAllLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scoringmethod, setScoringMethod] = useState("");
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = new Date();
    const offsetMinutes = localDate.getTimezoneOffset();
    const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000);
    const todayDate = adjustedDate.toISOString().slice(0, 10); // Format: YYYY-MM-DD


    useEffect(() => {
        const fetchScoringMethod = async () => {
            try {
                const res = await axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-scoring-method.php`, {
                    params: { user_id: userId, group_id: id }
                });

                console.log("Fetched Scoring Method:", res.data.scoring_method);

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
                const todayResponse = await axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-score.php`, {
                    params: { groupId: id, groupName, game, timeZone, today: todayDate }
                });

                // Fetch All Scores (without date filter)
                const allResponse = await axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-score.php`, {
                    params: { groupId: id, groupName, game, timeZone }
                });

                setTodayLeaderboard(todayResponse.data.data || []);
                setAllLeaderboard(allResponse.data.data || []);
            } catch (error) {
                console.error("Error fetching group stats:", error);
                setError("Failed to load scores. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupStats();
    }, [id, groupName, game]);

    // Function to get the max possible score for a game
    const getTotalScore = (gameName) => {
        const cleanedName = gameName ? gameName.trim().toLowerCase() : "";
        return cleanedName === "wordle" ? 6 :
               cleanedName === "connections" ? 4 :
               cleanedName === "phrazle" ? 6 :
               1; // Default to 1 if unknown
    };

   // Aggregate all scores and calculate total possible scores
    const aggregatedAllScores = allLeaderboard.reduce((acc, data) => {
        if (Number(data.gamlescore) === 6) return acc; // Exclude rows where gamlescore is 7

        if (!acc[data.username]) {
            acc[data.username] = { 
                username: data.username,
                avatar: data.avatar,
                gamlescore: 0,
                totalGames: 0,
                totalScore: 0, // Sum of possible scores
                gamenames: new Set()
            };
        }

        // Get the correct score multiplier
        const gameMultiplier = getTotalScore(data.gamename);

        // Aggregate scores
        acc[data.username].gamlescore += Number(data.gamlescore);
        acc[data.username].totalGames += 1;
        acc[data.username].totalScore += gameMultiplier; // Sum up total possible score
        acc[data.username].gamenames.add(data.gamename);

        return acc;
    }, {});

    // Convert object to an array for rendering
    const allLeaderboardArray = Object.values(aggregatedAllScores).map(user => ({
        ...user,
        gamenames: [...user.gamenames].join(", ") 
    }));

    console.log("todayLeaderboard:", todayLeaderboard);

    return (
        <div>
            {loading && <p>Loading scores...</p>}
            {error && <p className="text-danger">{error}</p>}
            <h4 className="py-3 text-center">Today's Leaderboard</h4>
            <h6 className="py-3">Scoring Method: {scoringmethod}</h6>
            
            {!loading && !error && (
                <Row className="justify-content-center leaderboard">
                    <Col md={4}>
                    {todayLeaderboard.length > 0 ? (
                        <>
                            {/* Separate Phrazle AM and PM */}
                            {["AM", "PM"].map((timePeriod) => {
                                const filteredPhrazle = todayLeaderboard.filter((data) => {
                                    if (data.gamename !== "phrazle") return false;
                                    const gameTime = new Date(data.createdat).getHours();
                                    console.log('gameTime',gameTime);
                                    return timePeriod === "AM" ? gameTime < 12 : gameTime >= 12;
                                });

                                return (
                                    filteredPhrazle.length > 0 && (
                                        <div key={timePeriod}>
                                            <h5 className="text-center">{`Phrazle ${timePeriod}`}</h5>
                                            {filteredPhrazle.map((data, index) => {
                                            const totalScore = getTotalScore(data.gamename);
                                            const progressValue =
                                                totalScore > 0
                                                    ? data.gamename === "connections"
                                                        ? (data.gamlescore / totalScore) * 100
                                                        : ((totalScore - data.gamlescore) / (totalScore - 1)) * 100
                                                    : 0;

                                            return (
                                                <Row 
                                                    key={index} 
                                                    className="justify-content-between align-items-center py-2 px-3 mb-2 bg-light rounded shadow-sm"
                                                >
                                                    {/* Avatar + Username */}
                                                    <Col xs={5} className="d-flex align-items-center gap-2">
                                                        <img 
                                                            src={data.avatar ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${data.avatar}` : "https://via.placeholder.com/50"} 
                                                            alt="Avatar" 
                                                            className="rounded-circle border" 
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                                        />
                                                        <span className="fw-semibold">{data.username}</span>
                                                    </Col>

                                                    {/* Progress Bar */}
                                                    <Col xs={5}>
                                                        <ProgressBar 
                                                            now={progressValue} 
                                                            className={`${data.gamename}-progressbar`} 
                                                            variant="success"
                                                            style={{ height: '8px' }}
                                                        />
                                                    </Col>

                                                    {/* Score */}
                                                    <Col xs={2} className="text-center fw-bold">
                                                        {data.gamlescore}
                                                    </Col>
                                                </Row>
                                            );
                                        })}

                                        </div>
                                    )
                                );
                            })}

                            {/* Render non-Phrazle games */}
                            {!loading && !error && todayLeaderboard.length > 0 && (() => {
                                // Filter out "phrazle" and find the lowest score
                                const filteredLeaderboard = todayLeaderboard.filter((data) => data.gamename !== "phrazle");
                                if (filteredLeaderboard.length === 0) return null;

                                const minScore = Math.min(...filteredLeaderboard.map(data => Number(data.gamlescore)));

                                // Find all players with the lowest score
                                const winners = filteredLeaderboard.filter(data => Number(data.gamlescore) === minScore);

                                // Select only one winner (based on first occurrence)
                                const singleWinner = winners.length > 0 ? winners[0] : null;

                                return (
                                    <>
                                        {/* Winner Announcement */}
                                        {/* {singleWinner && (
                                            <h4 className="text-center text-success py-3">
                                                🏆 Winner: {singleWinner.username} 🏆
                                            </h4>
                                        )} */}

                                        {/* Main Leaderboard */}
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

                                                const isWinner = singleWinner && data.username === singleWinner.username;

                                                return (
                                                    <Row 
                                                        key={index} 
                                                        className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                                    >
                                                        {/* Rank + Avatar */}
                                                        <Col xs={3} className="d-flex align-items-center gap-2">
                                                            <img 
                                                                src={data.avatar ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${data.avatar}` : "https://via.placeholder.com/50"} 
                                                                alt="Avatar" 
                                                                className="rounded-circle border" 
                                                                style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                                            />
                                                        </Col>

                                                        {/* Username */}
                                                        <Col xs={4} className="text-start fw-semibold">
                                                            {data.username}
                                                        </Col>

                                                        {/* Score & Progress */}
                                                        <Col xs={5}>
                                                            <Row className="align-items-center">
                                                                <Col xs={7}>
                                                                    {scoringmethod === "Golf" ? (
                                                                        <> 
                                                                            <ProgressBar 
                                                                                className={`${data.gamename}-progressbar`} 
                                                                                variant="success" 
                                                                                now={data.gamlescore} 
                                                                                max={totalScore} 
                                                                                style={{ height: '8px' }}
                                                                            />
                                                                        </>
                                                                    ) : scoringmethod === "World Cup" ? (
                                                                        <> 
                                                                            <ProgressBar 
                                                                                className={`${data.gamename}-progressbar`} 
                                                                                variant="success" 
                                                                                now={isWinner ? 3 : 0} 
                                                                                max={totalScore} 
                                                                                style={{ height: '8px' }}
                                                                            />
                                                                        </>
                                                                    ) : scoringmethod === "Pesce" ? (
                                                                        <> 
                                                                            <ProgressBar 
                                                                                className={`${data.gamename}-progressbar`} 
                                                                                variant="success" 
                                                                                now={isWinner ? 1 : 0} 
                                                                                max={totalScore} 
                                                                                style={{ height: '8px' }}
                                                                            />
                                                                        </>
                                                                    ) : (
                                                                        <> {data.gamlescore} </>
                                                                    )}
                                                                </Col>
                                                                <Col xs={5} className="text-center d-flex fw-bold">
                                                                    {scoringmethod === "Golf" ? (
                                                                        <> {data.gamlescore} {isWinner && "🏆"} </>
                                                                    ) : scoringmethod === "World Cup" ? (
                                                                        <> {isWinner ? 3 : 0} {isWinner && "🏆"} </>
                                                                    ) : scoringmethod === "Pesce" ? (
                                                                        <> {isWinner ? 1 : 0} {isWinner && "🏆"} </>
                                                                    ) : (
                                                                        <> {data.gamlescore} {isWinner && "🏆"} </>
                                                                    )}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                );
                                            })}
                                    </>
                                );
                            })()}




                        </>
                    ) : (
                        <p className="text-center">No scores found today.</p>
                    )}

                    </Col>
                </Row>
            )}


            {/* Cumulative Leaderboard */}
            {!loading && !error && (
                <Row className="justify-content-center leaderboard mt-4">
                    <Col md={6} lg={5}>
                        <h4 className="py-3 text-center">Cumulative Leaderboard</h4>
                        {allLeaderboardArray.length > 0 ? (
                            <>
                                {allLeaderboardArray
                                    .slice()
                                    .sort((a, b) => a.gamlescore - b.gamlescore) // Sort by highest score
                                    .map((data, index) => (
                                        <Row 
                                            key={index} 
                                            className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                        >
                                            {/* Rank and Avatar */}
                                            <Col xs={3} className="d-flex align-items-center gap-2">
                                                
                                                <img 
                                                    src={data.avatar ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${data.avatar}` : "https://via.placeholder.com/50"} 
                                                    alt="Avatar" 
                                                    className="rounded-circle border" 
                                                    style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                                />
                                            </Col>

                                            {/* Username */}
                                            <Col xs={4} className="text-start fw-semibold">
                                                {data.username}
                                            </Col>

                                            {/* Score & Progress */}
                                            <Col xs={5}>
                                                <Row className="align-items-center">
                                                    <Col xs={9}>
                                                        <ProgressBar 
                                                            now={(data.gamlescore / data.totalScore) * 100} 
                                                            className={`${data.gamenames}-progressbar`} 
                                                            variant="success"
                                                            style={{ height: '8px' }}
                                                        />
                                                    </Col>
                                                    <Col xs={3} className="text-center fw-bold">
                                                        {data.gamlescore}
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    ))}
                            </>
                        ) : (
                            <p className="text-center">No cumulative scores available.</p>
                        )}
                    </Col>
                </Row>
            )}


        </div>
    );
}

export default GroupLeaderboardScores;
