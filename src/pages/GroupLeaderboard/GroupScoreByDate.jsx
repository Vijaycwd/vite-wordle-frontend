import React, { useEffect, useState, forwardRef } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import GetGroupScore from '../../constant/Models/GetGroupScore';

function GroupScoreByDate() {
    const { id, groupName, game } = useParams();
    const [todayLeaderboard, setTodayLeaderboard] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [dataFetchedError, setFetchedError] = useState(false);
    const [scoringmethod, setScoringMethod] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [dayResults, setDayResults] = useState(null);
    const [selectedGame, setSelectedGame] = useState("");
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;
    const loginuserEmail = USER_AUTH_DATA?.email;
 

    useEffect(() => {
        const fetchScoringMethod = async () => {
            try {
                const res = await axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-scoring-method.php`, {
                    params: { user_id: userId, group_id: id }
                });

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
            

            if (response.data.status === "success" && Array.isArray(response.data.data) && response.data.data.length > 0) {
                setTodayLeaderboard(response.data.data); // Ensure we're accessing the correct array
                setDataFetched(true);
                setFetchedError(false);
            } else {
                setTodayLeaderboard([]);
                setDataFetched(true);
                setFetchedError(true);
            }
        })
        .catch((error) => {
            console.error("API Error:", error);
            setTodayLeaderboard([]);
            setDataFetched(true);
            setFetchedError(true);
        });
    };
    // Custom input button for DatePicker
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <Button className={`example-custom-input px-5 btn btn-primary ${game}-btn`} onClick={onClick} ref={ref}>
        Go To Date
    </Button>
    ));
// Function to get the max possible score for a game
const getTotalScore = (gameName) => {
    const cleanedName = gameName ? gameName.trim().toLowerCase() : "";
    return cleanedName === "wordle" ? 6 :
           cleanedName === "connections" ? 4 :
           cleanedName === "phrazle" ? 6 :
           1; // Default to 1 if unknown
};

const showDayResult = (date, useremail, game) => {
    
    setSelectedGame(game);
    const timeZone = moment.tz.guess();
    axios.get(`https://coralwebdesigns.com/college/wordgamle/games/${game}/get-score.php`, {
        params: { useremail, timeZone, today: date }
    })
    .then((response) => {
        let scoreData = [];

        // Assign correct data based on game type
        if (game === "wordle") {
            scoreData = response.data?.wordlescore || [];
        } else if (game === "connections") {
            scoreData = response.data?.connectionsscore || [];
            console.log('connections',scoreData);
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
                {dataFetched &&todayLeaderboard.length > 0 ? (
                                            <>
                    {/* Separate Phrazle AM and PM */}
                    {["AM", "PM"].map((timePeriod) => {
                        const filteredPhrazle = todayLeaderboard.filter((data) => {
                            if (data.gamename !== "phrazle") return false;
                            const gameTime = new Date(data.createdat).getHours();
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
                    {todayLeaderboard.length > 0 && (() => {
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
                                                                <> {data.gamlescore}</>
                                                            )}
                                                        </Col>
                                                        <Col xs={5} className="text-center d-flex fw-bold">
                                                            {scoringmethod === "Golf" ? (
                                                                <span onClick={() => showDayResult(data.createdat, data.useremail, data.gamename)} style={{ cursor: "pointer" }}>
                                                                    {data.gamlescore} {isWinner && "🏆"}
                                                                </span>
                                                            ) : scoringmethod === "World Cup" ? (
                                                                <span onClick={() => showDayResult(data.createdat, data.useremail, data.gamename)} style={{ cursor: "pointer" }}>
                                                                    {isWinner ? 3 : 0} {isWinner && "🏆"}
                                                                </span>
                                                            ) : scoringmethod === "Pesce" ? (
                                                                <span onClick={() => showDayResult(data.createdat, data.useremail, data.gamename)} style={{ cursor: "pointer" }}>
                                                                    {isWinner ? 1 : 0} {isWinner && "🏆"}
                                                                </span>
                                                            ) : (
                                                                <span onClick={() => showDayResult(data.createdat, data.useremail)} style={{ cursor: "pointer" }}>
                                                                    {data.gamlescore} {isWinner && "🏆"}
                                                                </span>
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
                dataFetched && (
                    <Alert key='danger' variant='danger' className='p-1'>
                        No data found for the selected date.
                    </Alert>
                )
            )}
                </Col>
            </Row>
            <Row>
                <Col>
                    <GetGroupScore
                        showForm={showModal} 
                        handleFormClose={handleCloseModal} 
                        dayResults={dayResults}
                        game={selectedGame}
                    />
                </Col>
            </Row>
        </>
    );
}

export default GroupScoreByDate;
