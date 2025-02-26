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

// Aggregate scores and count games per user
const aggregatedAllScores = allLeaderboard.reduce((acc, data) => {
    if (!acc[data.username]) {
        acc[data.username] = { 
            ...data, 
            gamlescore: 0, 
            totalScore: 0 
        };
    }
    acc[data.username].gamlescore += Number(data.gamlescore); // Sum gamlescore
    acc[data.username].totalScore += data.gamename.toLowerCase() === "wordle" ? 6 : 1;
    return acc;
}, {});

// Convert object to array
const allLeaderboardArray = Object.values(aggregatedAllScores);


    return (
        <div>
            {loading && <p>Loading scores...</p>}
            {error && <p className="text-danger">{error}</p>}

           
            {!loading && !error && todayLeaderboard.length > 0 && (
                <Row className="justify-content-center leaderboard ">
                    <Col md={4}>
                        <h4>Today's Leaderboard</h4>
                        <h5 className="pb-3">Low Score</h5>
                        {todayLeaderboard
                            .slice()
                            .sort((a, b) => a.gamlescore - b.gamlescore)
                            .map((data, index) => (
                                <Row key={index} className="justify-content-center align-items-center py-1">
                                    <Col md={8} xs={8}>
                                        <ProgressBar now={(data.gamlescore / 5) * 100} className={`${data.gamename}-progressbar`}/>
                                    </Col>
                                    <Col md={4} xs={4}>
                                        {data.username} ({`${data.gamlescore}/5`})
                                    </Col>
                                </Row>
                                
                            ))}
                    </Col>
                </Row>
            )}
            
            
            
            {!loading && !error && allLeaderboardArray.length > 0 && (
                <Row className="justify-content-center leaderboard mt-4">
                    <Col md={4}>
                        <h4>Cumulative Leaderboard</h4>
                        {allLeaderboardArray
                            .slice()
                            .sort((a, b) => b.gamlescore - a.gamlescore) // Sort by highest total score
                            .map((data, index) => (
                                <Row key={index} className="justify-content-center align-items-center py-1">
                                    <Col md={8} xs={8}>
                                    <ProgressBar now={data.totalScore > 0 ? (data.gamlescore / (data.totalScore * (data.gamename === 'wordle' ? 6 : 5))) * 100 : 0} className={`${data.gamename}-progressbar`}/>
                                    </Col>
                                    <Col md={4} xs={4}>
                                        {data.username} (Total: {data.gamlescore}) <br />
                                       
                                    </Col>
                                </Row>
                            ))}
                    </Col>
                </Row>
            )}

        </div>
        
    );
}

export default GroupLeaderboardScores;
