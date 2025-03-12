import React, { useEffect, useState, forwardRef } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';

function GroupScoreByDate() {
    const { id, groupName, game } = useParams();
    const [allLeaderboard, setAllLeaderboard] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [dataFetchedError, setFetchedError] = useState(false);
    const [scoringmethod, setScoringMethod] = useState("");
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;

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



    // Function to format date for backend
    const formatDateForBackend = (date) => moment(date).format('YYYY-MM-DD');

    // Handle date selection
    const handleDateChange = (date) => {
        setStartDate(date);
        fetchDataByDate(formatDateForBackend(date));  // Fetch data on date change
    };

    // Fetch data by selected date
    const fetchDataByDate = (date) => {
        const timeZone = moment.tz.guess(); // Get user's time zone

        axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-score.php`, {
            params: { groupId: id, groupName, game, today: date, timeZone }
        })
        .then((response) => {
            console.log("API Response:", response.data);

            if (response.data.status === "success" && Array.isArray(response.data.data) && response.data.data.length > 0) {
                setAllLeaderboard(response.data.data); // Ensure we're accessing the correct array
                setDataFetched(true);
                setFetchedError(false);
            } else {
                setAllLeaderboard([]);
                setDataFetched(true);
                setFetchedError(true);
            }
        })
        .catch((error) => {
            console.error("API Error:", error);
            setAllLeaderboard([]);
            setDataFetched(true);
            setFetchedError(true);
        });
    };

    const formatCreatedAt = (createdat) => moment(createdat).format('DD-MMM-YYYY');
    // Custom input button for DatePicker
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <Button className={`example-custom-input px-5 btn btn-primary ${game}-btn`} onClick={onClick} ref={ref}>
        Go To Date
    </Button>
    ));

   // Function to get the max possible score for a game
   const getTotalScore = (gameName) => {
    const cleanedName = gameName ? gameName.trim().toLowerCase() : "";
    return cleanedName === "wordle" ? 7 :
           cleanedName === "connections" ? 4 :
           cleanedName === "phrazle" ? 7 :
           1; // Default to 1 if unknown
};

// Aggregate all scores and calculate total possible scores
const aggregatedAllScores = allLeaderboard.reduce((acc, data) => {
    if (Number(data.gamlescore) === 7) return acc; // Exclude rows where gamlescore is 7

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
    gamename: [...user.gamenames][0] || "", // Ensure a single game name is used
    gamenames: [...user.gamenames].join(", ")
}));
    return (
        <>
            <div className='text-center'>
                <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    customInput={<ExampleCustomInput />}
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                />
            </div>
            <Row className="justify-content-center leaderboard mt-4">
                <Col md={5} className="text-center">
                {dataFetched ? (
                    allLeaderboardArray.length > 0 ? (
                        <>
                            <h4 className="py-3 text-center">Cumulative Leaderboard</h4>
                            {allLeaderboardArray.length > 0 ? (
                                <>
                                    {allLeaderboardArray
                                        .slice()
                                        .sort((a, b) => a.gamlescore - b.gamlescore) // Sorting by lowest score first
                                        .map((data, index, arr) => {
                                            // Determine isWinner based on scoring method
                                            let isWinner = false;
                                            if (scoringmethod === "Golf") {
                                                isWinner = data.gamlescore === Math.min(...arr.map(item => item.gamlescore));
                                            } else {
                                                isWinner = data.gamlescore === Math.max(...arr.map(item => item.gamlescore));
                                            }

                                            return (
                                                <Row 
                                                    key={index} 
                                                    className={`justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm`}
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
                                                            <Col xs={8}>
                                                                <ProgressBar 
                                                                    now={(data.gamlescore / data.totalScore) * 100} 
                                                                    className={`${data.gamenames}-progressbar`} 
                                                                    variant="success"
                                                                    style={{ height: '8px' }}
                                                                />
                                                            </Col>
                                                            <Col xs={4} className="text-center fw-bold">
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
                            ) : (
                                <p className="text-center">No cumulative scores available.</p>
                            )}
                        </>
                    ) : (
                        <Alert key="danger" variant="danger" className="p-1 text-center">
                            No cumulative scores available for the selected date.
                        </Alert>
                    )
                ) : null}


                </Col>
            </Row>
        </>
    );
}

export default GroupScoreByDate;
