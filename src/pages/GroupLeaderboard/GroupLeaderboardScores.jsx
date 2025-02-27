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

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = new Date();
    const offsetMinutes = localDate.getTimezoneOffset();
    const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000);
    const todayDate = adjustedDate.toISOString().slice(0, 10); // Format: YYYY-MM-DD

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
        if (!acc[data.username]) {
            acc[data.username] = { 
                username: data.username,
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

    return (
        <div>
            {loading && <p>Loading scores...</p>}
            {error && <p className="text-danger">{error}</p>}

            {/* Today's Leaderboard */}
            {!loading && !error && todayLeaderboard.length > 0 && (
                <Row className="justify-content-center leaderboard">
                    <Col md={4}>
                        <h4>Today's Leaderboard</h4>
                        <h5 className="pb-3">Low Score</h5>
                        
                        {todayLeaderboard
                            .slice()
                            .sort((a, b) => a.gamlescore - b.gamlescore)
                            .map((data, index) => {
                                const totalScore = getTotalScore(data.gamename);
                                return (
                                    <Row key={index} className="justify-content-center align-items-center py-1">
                                        <Col md={8} xs={8}>
                                            <ProgressBar 
                                                now={(data.gamlescore / totalScore) * 100} 
                                                className={`${data.gamename}-progressbar`}
                                            />
                                        </Col>
                                        <Col md={4} xs={4}>
                                            {data.username} ({`${data.gamlescore}/${totalScore}`})
                                        </Col>
                                    </Row>
                                );
                            })}
                    </Col>
                </Row>
            )}

            {/* Cumulative Leaderboard */}
            {!loading && !error && allLeaderboardArray.length > 0 && (
                <Row className="justify-content-center leaderboard mt-4">
                    <Col md={4}>
                        <h4>Cumulative Leaderboard</h4>
                        
                        {allLeaderboardArray
                            .slice()
                            .sort((a, b) => b.gamlescore - a.gamlescore) // Sort by highest score
                            .map((data, index) => {
                                console.log(data.gamenames)
                                return (
                                    <Row key={index} className="justify-content-center align-items-center py-1">
                                        <Col md={8} xs={8}>
                                            <ProgressBar 
                                                now={(data.gamlescore / data.totalScore) * 100} 
                                                className={`${data.gamenames}-progressbar`}
                                            />
                                        </Col>
                                        <Col md={4} xs={4}>
                                            {data.username} ({data.gamlescore}/{data.totalScore}) <br />
                                            {/* Games Played: {data.totalGames} */}
                                        </Col>
                                    </Row>
                                );
                            })}
                    </Col>
                </Row>
            )}
        </div>
    );
}

export default GroupLeaderboardScores;
