import React, { useEffect, useState, forwardRef } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";

function GroupScoreByDate() {
    const { id, groupName, game } = useParams();
    const [todayLeaderboard, setTodayLeaderboard] = useState([]);
    const [latestJoinDate, setlatestJoinDate] = useState('');
    const [cumulativeAverageScore, setcumulativeAverageScore] = useState([]);
    const [cumulativeDailyScore, setcumulativeDailyScore] = useState([]);
    const [missedScore, setMissedScore] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [dataFetchedError, setFetchedError] = useState(false);
    const [scoringmethod, setScoringMethod] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [dayResults, setDayResults] = useState(null);
    const [selectedGame, setSelectedGame] = useState("");
    const [period, setPeriod] = useState('');
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
    //const formatDateForBackend = (date) => moment(date).format('YYYY-MM-DD');

    // Handle date selection
    // const handleDateChange = (date) => {
    //     setStartDate(date);
    //     fetchDataByDate(formatDateForBackend(date));  // Fetch data on date change
    // };

    const formatDateForBackend = (date) => {
        if (!date || isNaN(date.getTime())) return "";
        return moment(date).format("YYYY-MM-DD");
    };

   
    const handleDateChange = (date) => {
        if (!date || isNaN(date.getTime())) return;
    
        const formattedDate = formatDateForBackend(date);
    
        if (game === 'phrazle') {
            const newPeriod = 'AM';
            fetchDataByDate(formattedDate, newPeriod);
            setStartDate(date);
            setPeriod(newPeriod);
        } else {
            setStartDate(date);
            fetchDataByDate(formattedDate);
        }
    };
    const goToPreviousDay = () => {
        const prevDate = dayjs(startDate).subtract(1, 'day').toDate();
    
        if (game === 'phrazle') {
            if (period === 'PM') {
                const newPeriod = 'AM';
                const formattedDate = formatDateForBackend(startDate);
                fetchDataByDate(formattedDate, newPeriod);
                setPeriod(newPeriod);
            } else {
                const newPeriod = 'PM';
                const formattedDate = formatDateForBackend(prevDate);
                fetchDataByDate(formattedDate, newPeriod);
                setStartDate(prevDate);
                setPeriod(newPeriod);
            }
        } else {
            handleDateChange(prevDate);
        }
    };
    
    
    const goToNextDay = () => {
        const maxAllowedDate = dayjs().subtract(1, 'day').startOf('day'); // Yesterday (May 1)
        const nextDate = dayjs(startDate).add(1, 'day').startOf('day');
        const currentDate = dayjs(startDate).startOf('day');
    
        if (game === 'phrazle') {
            if (period === 'AM') {
                const newPeriod = 'PM';
                const formattedDate = formatDateForBackend(startDate);
                fetchDataByDate(formattedDate, newPeriod);
                setPeriod(newPeriod);
            } else {
                if (nextDate.isAfter(maxAllowedDate)) return; // Don't go beyond May 1
                const newPeriod = 'AM';
                const formattedDate = formatDateForBackend(nextDate.toDate());
                fetchDataByDate(formattedDate, newPeriod);
                setStartDate(nextDate.toDate());
                setPeriod(newPeriod);
            }
        } else {
            if (nextDate.isAfter(maxAllowedDate)) return; // Don't go beyond May 1
            handleDateChange(nextDate.toDate());
        }
    };
    
    
    

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => {
        const parsedDate = dayjs(value, "DD-MM-YYYY");

        return (
            <>
                <Button className={`example-custom-input px-5 btn btn-primary ${game}-btn`} onClick={onClick} ref={ref}>
            Go To Date
        </Button>
            
        
            </>
        );
    });
    // useEffect(() => {
    //     const formattedDate = formatDateForBackend(startDate);
    //     fetchDataByDate(formattedDate);
    // }, []);
    // Fetch data by selected date
    const fetchDataByDate = async (date, customPeriod = null) => {
        try {
            const timeZone = moment.tz.guess();
            
            const baseParams = {
                groupId: id,
                groupName,
                game,
                today: date,
                timeZone,
                formattedYesterday: date
            };
    
            // Add period if game is phrazle
            const params = game === 'phrazle' 
                ? { ...baseParams, period: customPeriod || period }
                : baseParams;
    
            const [todayResponse, cumulativeAverageResponse, cumulativeDailyResponse] = await Promise.all([
                axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-score.php`, { params }),
                axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-cumulative-average-score.php`, { params }),
                axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-cumulative-score-bydate.php`, { params }),
            ]);
    
            if (
                todayResponse.data.status === "success" &&
                Array.isArray(todayResponse.data.data)
            ) {
                setTodayLeaderboard(todayResponse.data.data);
            } else {
                setTodayLeaderboard([]);
                setFetchedError(true);
            }
    
            setlatestJoinDate(cumulativeDailyResponse.data.latestJoinDate || []);
            setcumulativeAverageScore(cumulativeAverageResponse.data.data || []);
            setcumulativeDailyScore(cumulativeDailyResponse.data.data || []);
           
    
            setDataFetched(true);
    
        } catch (error) {
            console.error("API Error:", error);
            setTodayLeaderboard([]);
            setFetchedError(true);
            setDataFetched(true);
        }
    };
    
    
    console.log('todayLeaderboard',todayLeaderboard);
    // Custom input button for DatePicker
    // const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    //     <Button className={`example-custom-input px-5 btn btn-primary ${game}-btn`} onClick={onClick} ref={ref}>
    //     Go To Date
    // </Button>
    // ));
    

// Function to get the max possible score for a game
const getTotalScore = (gameName) => {
    const cleanedName = gameName ? gameName.trim().toLowerCase() : "";
    return cleanedName === "wordle" ? 7 :
           cleanedName === "connections" ? 4 :
           cleanedName === "phrazle" ? 7 :
           1; // Default to 1 if unknown
};

const showDayResult = (date, useremail, game) => {
    console.log('showDayResult');
    // setSelectedGame(game);
    const timeZone = moment.tz.guess();
    axios.get(`https://coralwebdesigns.com/college/wordgamle/games/${game}/get-group-score.php`, {
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

        // setDayResults(scoreData);
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
                {/* <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    customInput={<ExampleCustomInput />}
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                /> */}
                <DatePicker
                    onChange={handleDateChange}
                    customInput={<ExampleCustomInput />}
                    maxDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
            </div>
            <Row className="justify-content-center leaderboard mt-4">
                <Col md={5} className="text-center">
                {dataFetched && todayLeaderboard.length > 0 ? (
                    <>
                    {todayLeaderboard.some(data => data.gamename === "phrazle") && (
                        <div className="d-flex align-items-center justify-content-center gap-3 cursor-pointer text-lg font-medium">
                            <button onClick={(e) => { e.stopPropagation(); goToPreviousDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                                <FaArrowLeft />
                            </button>
                            <div>
                                {dayjs(startDate).format("dddd, MMM D, YYYY")} - {period}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); goToNextDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                                <FaArrowRight />
                            </button>
                        </div>
                    )}

                    {/* Phrazle Game*/}
                    {["AM", "PM"].map((timePeriod) => {
                        const filteredPhrazle = todayLeaderboard.filter((data) => {
                            if (data.gamename !== "phrazle") return false;
                            const gameTime = new Date(data.createdat).getHours();
                            return timePeriod === "AM" ? gameTime < 12 : gameTime >= 12;
                        });

                        if (filteredPhrazle.length === 0) return null; // Skip rendering if no data for this time period

                        const minScore = Math.min(...filteredPhrazle.map((data) => Number(data.gamlescore ?? 4)));
                        const winners = filteredPhrazle.filter(data => Number(data.gamlescore ?? 4) === minScore);
                        return (
                            <div key={timePeriod}>
                                <h4 className="text-center py-3">Daily Leaderboard</h4>
                                {
                                    filteredPhrazle
                                    .slice()
                                    .sort((a, b) => a.gamlescore - b.gamlescore)
                                    .map((data, index) => {
                                      const totalScore = getTotalScore(data.gamename);
                                      const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                      const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);
                                      const worldCupScore = isSingleWinner ? 3 : isSharedWinner ? 1 : 0;
                                      const pesceScore = isSingleWinner ? 1 : isSharedWinner ? 1 : 0;
                              
                                      return (
                                        <Row key={index} className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm">
                                          <Col xs={3} className="d-flex align-items-center gap-2">
                                            <img 
                                              src={data.avatar ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${data.avatar}` : "https://via.placeholder.com/50"} 
                                              alt="Avatar" 
                                              className="rounded-circle border" 
                                              style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                            />
                                          </Col>
                                          <Col xs={4} className="text-start fw-semibold">{data.username}</Col>
                                          <Col xs={5}>
                                            <Row className="align-items-center">
                                              <Col xs={7}>
                                                <ProgressBar 
                                                  className={`${data.gamename}-progressbar`} 
                                                  variant="success" 
                                                  now={
                                                    scoringmethod === "Golf"
                                                      ? data.gamlescore ?? 4
                                                      : scoringmethod === "World Cup"
                                                      ? worldCupScore
                                                      : scoringmethod === "Pesce"
                                                      ? pesceScore
                                                      : data.gamlescore ?? 4
                                                  } 
                                                  max={totalScore} 
                                                  style={{ height: '8px' }}
                                                />
                                              </Col>
                                              <Col xs={5} className="text-center d-flex fw-bold">
                                                <span onClick={() => showDayResult(data.createdat, data.useremail, data.gamename)} style={{ cursor: "pointer" }}>
                                                  {scoringmethod === "Golf"
                                                    ? `${(data.gamlescore ?? '') === '' ? 4 : data.gamlescore}${isSingleWinner ? " 🏆" : ""}`
                                                    : scoringmethod === "World Cup"
                                                    ? `${worldCupScore}${isSingleWinner ? " 🏆" : ""}`
                                                    : scoringmethod === "Pesce"
                                                    ? `${pesceScore}${isSingleWinner ? " 🏆" : ""}`
                                                    : `${(data.gamlescore ?? '') === '' ? 4 : data.gamlescore}${isSingleWinner ? " 🏆" : ""}`
                                                  }
                                                </span>
                                              </Col>
                                            </Row>
                                          </Col>
                                        </Row>
                                      );
                                    })
                                }
                                    
                            </div>
                        );
                    })}

                    {/* Wordle, Connections */}

                    {todayLeaderboard.length > 0 && (() => {
                        // Filter out "phrazle" and find the lowest score
                        const filteredLeaderboard = todayLeaderboard.filter((data) => data.gamename !== "phrazle");
                        console.log('filteredLeaderboard',filteredLeaderboard);
                        if (filteredLeaderboard.length === 0) return null;

                        const minScore = Math.min(...filteredLeaderboard.map(data => Number(data.gamlescore ?? 7)));

                        // Find all players with the lowest score
                        const winners = filteredLeaderboard.filter(data => Number(data.gamlescore ?? 7) === minScore);
                        
                        return (
                            <>
                                <div className="d-flex align-items-center justify-content-center gap-3 cursor-pointer text-lg font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); goToPreviousDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                                        <FaArrowLeft />
                                    </button>
                                    <div>
                                        {dayjs(startDate).format("dddd, MMM D, YYYY")}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); goToNextDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                                        <FaArrowRight />
                                    </button>
                                </div>
                                <h4 className="text-center py-3">Daily Leaderboard</h4>
                                {
                                    filteredLeaderboard
                                    .slice()
                                    .sort((a, b) => b.gamlescore - a.gamlescore)
                                    .map((data, index) => {
                                        const totalScore = getTotalScore(data.gamename);
                                        const progressValue =
                                            totalScore > 0
                                                ? data.gamename === "connections"
                                                    ? (data.gamlescore / totalScore) * 100
                                                    : ((totalScore - data.gamlescore) / (totalScore - 1)) * 100
                                                : 0;

                                        const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                        const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);
                                        const worldCupScore = isSingleWinner ? 3 : isSharedWinner ? 1 : 0;
                                        const pesceScore = isSingleWinner ? 1 : isSharedWinner ? 1 : 0;

                                        return (
                                            <Row key={index} className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm">
                                                {/* Avatar */}
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

                                                {/* Score */}
                                                <Col xs={5}>
                                                    <Row className="align-items-center">
                                                        <Col xs={7}>
                                                            <ProgressBar 
                                                                className={`${data.gamename}-progressbar`} 
                                                                variant="success" 
                                                                now={
                                                                    scoringmethod === "Golf"
                                                                        ? data.gamlescore ?? 7
                                                                        : scoringmethod === "World Cup"
                                                                        ? worldCupScore
                                                                        : scoringmethod === "Pesce"
                                                                        ? pesceScore
                                                                        : (data.gamlescore ?? 7)
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
                                                                {scoringmethod === "Golf"
                                                                    ? (data.gamlescore ?? '') === '' ? 7 : data.gamlescore
                                                                    : scoringmethod === "World Cup"
                                                                    ? worldCupScore
                                                                    : pesceScore}
                                                                {isSingleWinner && " 🏆"}
                                                            </span>
                                                        </Col>

                                                        
                                                    </Row>
                                                </Col>
                                            </Row>
                                        );
                                    })
                                }
                            </>
                        );
                    })()}
                    </>
                ) : null}
                </Col>
            </Row>
                {dataFetched && todayLeaderboard.length > 0 ? (
                    <>
                    {/* Cumulative Leaderboard */}
                    <Row className="justify-content-center leaderboard mt-4">
                    <Col md={5}>
                    <h4 className="py-3 text-center">
                        Cumulative Leaderboard
                    </h4>
                    {latestJoinDate && (
                    <p className="text-center">
                        Start Date: {(() => {
                        const [year, month, day] = latestJoinDate.split(' ')[0].split('-');
                        return `${day}-${month}-${year}`;
                        })()}
                    </p>
                    )}
                        {cumulativeDailyScore &&
                        cumulativeDailyScore.length > 0 &&
                        cumulativeDailyScore.some(data => data.gamlescore !== undefined && !isNaN(Number(data.gamlescore)) && data.username) ? (
                            <>
                                {(() => {
                                    const minScore = Math.min(...cumulativeDailyScore.map(data => Number(data.gamlescore)));
                                    const winners = cumulativeDailyScore.filter(data => Number(data.gamlescore) === minScore);
    
                                    return cumulativeDailyScore
                                        .slice()
                                        .sort((a, b) =>
                                            scoringmethod === "Golf"
                                                ? a.gamlescore - b.gamlescore
                                                : (b.gamlescore ?? 0) - (a.gamlescore ?? 0)
                                        )
                                        .map((data, index) => {
                                            const totalScore = getTotalScore(data.gamename);
                                            const incrementScore = (index + 1) * totalScore;
    
                                            const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                            const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);
    
                                            const worldCupScore = isSingleWinner ? 3 : isSharedWinner ? 1 : 0;
                                            const pesceScore = isSharedWinner ? 1 : 0;
    
                                            return (
                                                <Row
                                                    key={index}
                                                    className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                                >
                                                    <Col xs={3} className="d-flex align-items-center gap-2">
                                                        <img
                                                            src={
                                                                data.avatar
                                                                    ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${data.avatar}`
                                                                    : "https://coralwebdesigns.com/college/wordgamle/user/uploads/default_avatar.png"
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
                                                                {/* <ProgressBar
                                                                    className={`${data.gamename}-progressbar`}
                                                                    variant="success"
                                                                    now={data.gamlescore}
                                                                    max={totalScore + incrementScore}
                                                                    style={{ height: "8px" }}
                                                                /> */}
                                                                {}
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
                                            );
                                        });
                                })()}
                            </>
                        ) : (
                            <Alert variant="info" className="text-center">
                                😕 No results found for this leaderboard.
                            </Alert>
                        )}
                    </Col>
                </Row>
                <Row className="justify-content-center leaderboard mt-4">
                    <Col md={5}>
                    <h4 className="py-3 text-center">
                        Average Leaderboard
                    </h4>
    
                        {cumulativeAverageScore &&
                        cumulativeAverageScore.length > 0 &&
                        cumulativeAverageScore.some(data => data.gamlescore !== undefined && !isNaN(Number(data.gamlescore)) && data.username) ? (
                            <>
                                {(() => {
                                    const minScore = Math.min(...cumulativeAverageScore.map(data => Number(data.gamlescore)));
                                    const winners = cumulativeAverageScore.filter(data => Number(data.gamlescore) === minScore);
    
                                    return cumulativeAverageScore
                                        .slice()
                                        // .sort((a, b) => (a.gamlescore / a.totalGamesPlayed) - (b.gamlescore / b.totalGamesPlayed))
                                        .sort((a, b) => {
                                            if (scoringmethod === "Golf") {
                                                return (a.gamlescore / a.totalGamesPlayed) - (b.gamlescore / b.totalGamesPlayed);
                                            } else if (scoringmethod === "World Cup") {
                                                return (b.gamlescore / b.totalGamesPlayed) - (a.gamlescore / a.totalGamesPlayed);
                                            } else if (scoringmethod === "Pesce") {
                                                return (b.gamlescore / b.totalGamesPlayed) - (a.gamlescore / a.totalGamesPlayed);
                                            }
                                            return 0;
                                        })
                                        .map((data, index) => {
                                            const totalScore = getTotalScore(data.gamename);
                                            const incrementScore = (index + 1) * totalScore;
    
                                            const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                            const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);
    
                                            const worldCupScore = isSingleWinner ? 3 : isSharedWinner ? 1 : 0;
                                            const pesceScore = isSharedWinner ? 1 : 0;
    
                                            return (
                                                <>
                                                {/* <p>Total Score - {data.gamlescore}</p>
                                                <p>Total Game Played {data.totalGamesPlayed}</p>
                                                <p>Game Chances {totalScore}</p> */}
                                                <Row
                                                    key={index}
                                                    className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                                >
                                                    <Col xs={3} className="d-flex align-items-center gap-2">
                                                        <img
                                                            src={
                                                                data.avatar
                                                                    ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${data.avatar}`
                                                                    : "https://coralwebdesigns.com/college/wordgamle/user/uploads/default_avatar.png"
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
                                                                {/* <ProgressBar
                                                                    className={`${data.gamename}-progressbar`}
                                                                    variant="success"
                                                                    now={data.gamlescore}
                                                                    max={totalScore + incrementScore}
                                                                    style={{ height: "8px" }}
                                                                /> */}
                                                                {}
                                                                <ProgressBar
                                                                    className={`${data.gamename}-progressbar`}
                                                                    variant="success"
                                                                    now={data.gamlescore}
                                                                    max={data.totalGamesPlayed * totalScore}
                                                                    style={{ height: "8px" }}
                                                                />
                                                            </Col>
                                                            <Col xs={3} className="text-center fw-bold">
                                                                {/* {data.gamlescore} */}  
                                                                {((data.gamlescore / data.totalGamesPlayed)).toFixed(2)}
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                </>
                                            );
                                        });
                                })()}
                            </>
                        ) : (
                            <Alert variant="info" className="text-center">
                                😕 No results found for this leaderboard.
                            </Alert>
                        )}
                    </Col>
                </Row>                   

                </>
            ) : (
                dataFetched && (
                    <Alert key='danger' variant='danger' className='p-1'>
                        No data found for the selected date.
                    </Alert>
                )
            )}
        </>
    );
}

export default GroupScoreByDate;
