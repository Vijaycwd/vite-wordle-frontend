import React, { useEffect, useState, forwardRef } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Button, Alert, Row, Col, ProgressBar, Modal  } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";

function GroupScoreByDate({ latestJoinDate, setSelectedMember, setShowProfile  }) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const { id, groupName, game } = useParams();
    const [todayLeaderboard, setTodayLeaderboard] = useState([]);
    // const [latestJoinDate, setlatestJoinDate] = useState('');
    const [totalGames, settotalGames] = useState('');
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
    //const formattedDate = latestJoinDate.slice(0, 10);
    const formattedDateStr = latestJoinDate ? latestJoinDate.slice(0, 10) : null;
    let minDate = new Date(); // fallback

    if (formattedDateStr && typeof formattedDateStr === 'string') {
        const parts = formattedDateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts.map(Number);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                minDate = new Date(year, month - 1, day);
            } else {
                console.error('Invalid date parts:', { year, month, day });
            }
        } else {
            console.error('Unexpected date format:', formattedDateStr);
        }
    }

    const minDateStr = minDate.toISOString().split('T')[0];
    

    useEffect(() => {
        const fetchScoringMethod = async () => {
            try {
                const res = await axios.get(`${baseURL}/groups/get-scoring-method.php`, {
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

    const formattedDateStr = formatDateForBackend(date); // "YYYY-MM-DD"

    if (game === 'phrazle') {
        const selectedDay = dayjs(date).format("YYYY-MM-DD");
        const joinDay = dayjs(latestJoinDate).format("YYYY-MM-DD");
        const joinHour = dayjs(latestJoinDate).hour();

        let newPeriod;

        if (selectedDay === joinDay) {
            // Same day as latest join
            newPeriod = joinHour >= 12 ? "PM" : "AM";
        } else if (dayjs(date).isAfter(dayjs(latestJoinDate), 'day')) {
            // Selected a future date → default to "AM"
            newPeriod = "AM";
        } else {
            // Selected a past date — use custom rule or fallback
            newPeriod = "PM";
        }

        fetchDataByDate(formattedDateStr, newPeriod);
        setStartDate(date);
        setPeriod(newPeriod);
    } else {
        setStartDate(date);
        fetchDataByDate(formattedDateStr);
    }
};


const showDayResult = (date, useremail, game, period) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const timeZone = moment.tz.guess();
    const params = { useremail, timeZone, today: formattedDate };

    if (game === "phrazle") {
        params.period = period;
    }

    axios.get(`${baseURL}/games/${game}/get-score.php`, { params })
        .then((response) => {
            let scoreData = [];

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


  const goToPreviousDay = () => {
      const prevDate = dayjs(startDate).subtract(1, 'day').toDate();
      const latest = dayjs(latestJoinDate);
      const latestDateOnly = latest.startOf('day');
  
      if (game === 'phrazle') {
          if (period === 'PM') {
              const newPeriod = 'AM';
              const formattedDateStr = formatDateForBackend(startDate);
  
              // Allow same-day AM if latestJoinDate is within that same day
              if (dayjs(startDate).isBefore(latestDateOnly)) return;
  
              setPeriod(newPeriod);
              setStartDate(startDate);
              fetchDataByDate(formattedDateStr, newPeriod);
          } else {
              // Going from AM ➝ PM of previous day
              if (dayjs(prevDate).isBefore(latestDateOnly)) return;
  
              const newPeriod = 'PM';
              const formattedDateStr = formatDateForBackend(prevDate);
              setStartDate(prevDate);
              setPeriod(newPeriod);
              fetchDataByDate(formattedDateStr, newPeriod);
          }
      } else {
          if (dayjs(prevDate).isBefore(latestDateOnly)) return;
          handleDateChange(prevDate);
      }
  };
    
const goToNextDay = () => {
    const now = dayjs();
    const today = now.startOf('day');
    const currentHour = now.hour();

    const maxAllowedDate = today.subtract(1, 'day'); // Only allow up to yesterday
    const startDay = dayjs(startDate).startOf('day');

    if (game === 'phrazle') {
        // If you're already at the max date and period is PM — BLOCK
        if (startDay.isSame(maxAllowedDate, 'day') && period === 'PM') {
            return; // ⛔ Cannot move forward
        }

        // If currently AM on max allowed date → move to PM
        if (startDay.isSame(maxAllowedDate, 'day') && period === 'AM') {
            const formattedDate = formatDateForBackend(startDate);
            setPeriod('PM');
            fetchDataByDate(formattedDate, 'PM');
            return;
        }

        // Otherwise move to next date AM
        const nextDate = startDay.add(1, 'day');
        if (nextDate.isAfter(maxAllowedDate)) return; // ⛔ Exceeds max allowed date

        const formattedDate = formatDateForBackend(nextDate.toDate());
        setStartDate(nextDate.toDate());
        setPeriod('AM');
        fetchDataByDate(formattedDate, 'AM');
    } else {
        // Non-phrazle games → up to yesterday only
        const nextDate = startDay.add(1, 'day');
        if (nextDate.isSame(today) || nextDate.isAfter(today)) return;

        const formattedDate = formatDateForBackend(nextDate.toDate());
        setStartDate(nextDate.toDate());
        fetchDataByDate(formattedDate);
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
useEffect(() => {
    const now = dayjs();
    const currentHour = now.hour();

    if (game === 'phrazle') {
        let date, period;

        if (currentHour < 12) {
            // Before noon: show yesterday PM
            date = now.subtract(1, 'day').toDate();
            period = 'PM';
        } else {
            // After noon: show today AM
            date = now.toDate();
            period = 'AM';
        }

        setStartDate(date);
        setPeriod(period);
        fetchDataByDate(formatDateForBackend(date), period);
    } else {
        const prevDate = now.subtract(1, 'day').toDate();
        setStartDate(prevDate);
        fetchDataByDate(formatDateForBackend(prevDate));
    }
}, [game]);

    const fetchDataByDate = async (date, currentPeriod = null) => {
        try {
            const timeZone = moment.tz.guess();
            
            const baseParams = {
                groupId: id,
                groupName,
                game,
                today: date,
                timeZone,
                formattedYesterday: date,
                scoringmethod
            };
    
            // Add period if game is phrazle
            const params = game === 'phrazle' 
                ? { ...baseParams, period: currentPeriod || period }
                : baseParams;
    
            const [todayResponse, cumulativeAverageResponse, cumulativeDailyResponse] = await Promise.all([
                axios.get(`${baseURL}/groups/get-group-score.php`, { params }),
                axios.get(`${baseURL}/groups/get-cumulative-average-score.php`, { params }),
                axios.get(`${baseURL}/groups/get-cumulative-score-bydate.php`, { params }),
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
           
            // setlatestJoinDate(cumulativeDailyResponse.data.latestJoinDate || []);
            settotalGames(cumulativeDailyResponse.data.totalGames || []);
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
    
    
    // console.log('todayLeaderboard',todayLeaderboard);
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




const handleCloseModal = () => {
    setShowModal(false);
    // if (updated) fetchGroupInfo();
};

const now = new Date();

let maxSelectableDate;

if (game === "phrazle") {
  const isAfternoon = now.getHours() >= 12;

  maxSelectableDate = isAfternoon
    ? new Date() // allow today, local time
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); // yesterday local midnight
} else {
  // For other games, only allow up to yesterday local midnight
  maxSelectableDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
}

// console.log("maxSelectableDate", maxSelectableDate);


const handleShowProfile = (data) => {
    setSelectedMember(data);
    setShowProfile(true);
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

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

// Helper to get period
const getPeriod = (createdat) => {
  const hour = new Date(createdat).getHours();
  return hour < 12 ? "AM" : "PM";
};

// Prepare sheriff list
let sheriffWinners = [];

// Loop through games
["phrazle", "wordle"].forEach(gameName => {
  if (gameName === "phrazle") {
    ["AM", "PM"].forEach(period => {
      const todayScores = todayLeaderboard.filter(d =>
        d.gamename === gameName && getPeriod(d.createdat) === period
      );

      const todayMinScore = Math.min(...todayScores.map(d => d.gamlescore ?? 999));
      const todayTopScorers = todayScores.filter(d => d.gamlescore === todayMinScore);

      const yesterdayScores = todayLeaderboard.filter(d =>
        d.gamename === gameName &&
        d.createdat?.startsWith(yesterdayStr) &&
        getPeriod(d.createdat) === period
      );

      const yesterdayMinScore = Math.min(...yesterdayScores.map(d => d.gamlescore ?? 999));
      const priorSheriffs = yesterdayScores
        .filter(d => d.gamlescore === yesterdayMinScore)
        .map(d => d.username);

      const winners =
        todayTopScorers.length === 1
          ? todayTopScorers
          : todayTopScorers.filter(d => !priorSheriffs.includes(d.username));

      sheriffWinners.push(...winners);
    });
  } else {
    // Non-phrazle game (no AM/PM split)
    const todayScores = todayLeaderboard.filter(d => d.gamename === gameName);

    const todayMinScore = Math.min(...todayScores.map(d => d.gamlescore ?? 999));
    const todayTopScorers = todayScores.filter(d => d.gamlescore === todayMinScore);

    const yesterdayScores = todayLeaderboard.filter(d =>
      d.gamename === gameName &&
      d.createdat?.startsWith(yesterdayStr)
    );

    const yesterdayMinScore = Math.min(...yesterdayScores.map(d => d.gamlescore ?? 999));
    const priorSheriffs = yesterdayScores
      .filter(d => d.gamlescore === yesterdayMinScore)
      .map(d => d.username);

    const winners =
      todayTopScorers.length === 1
        ? todayTopScorers
        : todayTopScorers.filter(d => !priorSheriffs.includes(d.username));

    sheriffWinners.push(...winners);
  }
});

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
                    minDate={minDate}
                    maxDate={game === 'phrazle' ? maxSelectableDate : dayjs().subtract(1, 'day').toDate()}
                    />
            </div>
            <Row className="justify-content-center leaderboard mt-4">
                <Col md={5} className="text-center">
                {dataFetched && todayLeaderboard.length > 0 ? (
                    <>
                    {todayLeaderboard.length > 0 && (() => {
                        // Filter out "phrazle" and find the lowest score
                        const filteredLeaderboard = todayLeaderboard.filter((data) => data.gamename === "phrazle" && String(data?.is_paused) === "0");
                        // console.log('filteredLeaderboard',filteredLeaderboard);
                        if (filteredLeaderboard.length === 0) return null;

                        const minScore = Math.min(
                            ...filteredLeaderboard.map(data => 
                                Number(data.gamlescore ?? getTotalScore(data.gamename))
                            )
                        );

                        // Find all players with the lowest score
                        const winners = filteredLeaderboard.filter(data => 
                            Number(data.gamlescore ?? getTotalScore(data.gamename)) === minScore
                        );
                        const latest = dayjs(latestJoinDate);
                        const latestDateOnly = latest.startOf('day');

                        const isMinPhrazleDate =
                            (period === 'AM' && dayjs(startDate).isSame(latestDateOnly, 'day') && latest.hour() < 12) ||  // Earliest is AM & join was AM
                            (period === 'PM' && dayjs(startDate).isSame(latestDateOnly, 'day'));                           // Earliest is PM

                        const isMaxPhrazleDate = (period === 'AM' && dayjs(startDate).isSame(dayjs(), 'day'));
                        return (
                            <>
                        
                                <div className="d-flex align-items-center justify-content-center gap-3 cursor-pointer text-lg font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); goToPreviousDay(); }}  disabled={isMinPhrazleDate} className="bg-dark text-white px-3 py-1 rounded">
                                        <FaArrowLeft />
                                    </button>
                                    <div>
                                        {dayjs(startDate).format("MMM D, YYYY")} - {period}
                                    </div>
                                    <button  onClick={(e) => { e.stopPropagation(); goToNextDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                                        <FaArrowRight />
                                    </button>
                                </div>
                                <h4 className="text-center py-3">Daily Leaderboard</h4>
                                {
                                    filteredLeaderboard
                                    .slice()
                                    .sort((a, b) => {
                                        const aScore = Number(a.gamlescore ?? getTotalScore(a.gamename));
                                        const bScore = Number(b.gamlescore ?? getTotalScore(b.gamename));

                                        const allLost = minScore === 7;

                                        const isSingleWinnerA = winners.length === 1 && winners[0].username === a.username;
                                        const isSharedWinnerA = winners.length > 1 && winners.some(w => w.username === a.username);
                                        const worldCupScoreA = allLost ? 0 : (isSingleWinnerA ? 3 : isSharedWinnerA ? 1 : 0);
                                        const pesceScoreA = allLost ? 0 : (isSingleWinnerA || isSharedWinnerA ? 1 : 0);

                                        const isSingleWinnerB = winners.length === 1 && winners[0].username === b.username;
                                        const isSharedWinnerB = winners.length > 1 && winners.some(w => w.username === b.username);
                                        const worldCupScoreB = allLost ? 0 : (isSingleWinnerB ? 3 : isSharedWinnerB ? 1 : 0);
                                        const pesceScoreB = allLost ? 0 : (isSingleWinnerB || isSharedWinnerB ? 1 : 0);

                                        if (scoringmethod === "Golf") {
                                            return aScore - bScore; // lower is better
                                        } else if (scoringmethod === "World Cup") {
                                            return worldCupScoreB - worldCupScoreA; // higher World Cup score is better
                                        } else if (scoringmethod === "Pesce") {
                                            return pesceScoreB - pesceScoreA; // higher Pesce score is better
                                        } else {
                                            return bScore - aScore; // default: higher is better
                                        }
                                    })


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

                                        const allLost = minScore === 7;
                                        const worldCupScore = allLost ? 0 : (isSingleWinner ? 3 : isSharedWinner ? 1 : 0);
                                        const pesceScore = allLost ? 0 : (isSingleWinner || isSharedWinner ? 1 : 0);

                                        return (
                                            <Row key={index} className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm">
                                                {/* Avatar */}
                                                <Col xs={3} className="d-flex align-items-center gap-2">
                                                    {/* <img 
                                                        src={data.avatar ? `${baseURL}/user/uploads/${data.avatar}` : `${baseURL}/user/uploads/default_avatar.png`} 
                                                        alt="Avatar" 
                                                        className="rounded-circle border" 
                                                        style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                                    /> */}
                                                    <div onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                        <img
                                                            src={
                                                            data.avatar
                                                                ? `${baseURL}/user/uploads/${data.avatar}`
                                                                : `${baseURL}/user/uploads/default_avatar.png`
                                                            }
                                                            alt="Profile"
                                                            className="rounded-circle mb-1"
                                                            style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                </Col>

                                                {/* Username */}
                                                <Col xs={4} className="text-start fw-semibold" onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
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
                                                                        ? data.gamlescore ?? totalScore
                                                                        : scoringmethod === "World Cup"
                                                                        ? worldCupScore
                                                                        : scoringmethod === "Pesce"
                                                                        ? pesceScore
                                                                        : (data.gamlescore ?? totalScore)
                                                                } 
                                                                max={totalScore} 
                                                                style={{ height: '8px' }}
                                                            />
                                                        </Col>
                                                        <Col xs={5} className="text-center d-flex fw-bold">
                                                            <span
                                                                onClick={() => showDayResult(data.createdat, data.useremail, data.gamename, period)}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                {scoringmethod === "Golf"
                                                                    ? (data.gamlescore ?? '') === '' ? totalScore : data.gamlescore
                                                                    : scoringmethod === "World Cup"
                                                                    ? worldCupScore
                                                                    : pesceScore}
                                                                {/* {scoringmethod === "Pesce" && isSheriff(data.username) && " 🤠"} */}
                                                                {scoringmethod !== "Pesce" && isSingleWinner && " 🏆"}
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
                    {/* Wordle, Connections */}

                    {todayLeaderboard.length > 0 && (() => {
                        const filteredLeaderboard = todayLeaderboard.filter((data) => data.gamename !== "phrazle" && String(data?.is_paused) === "0");
                        if (filteredLeaderboard.length === 0) return null;

                        // Group scores by game
                        const gameScoresMap = {};
                        filteredLeaderboard.forEach(d => {
                            const score = Number(d.gamlescore ?? getTotalScore(d.gamename));
                            if (!gameScoresMap[d.gamename]) gameScoresMap[d.gamename] = [];
                            gameScoresMap[d.gamename].push({ ...d, score });
                        });

                        // Find best score per game (lowest score wins for Wordle & Connections)
                        const gameBestScores = {};
                        Object.entries(gameScoresMap).forEach(([gamename, scores]) => {
                            const best = Math.min(...scores.map(s => s.score)); // LOWEST always wins for both
                            gameBestScores[gamename] = best;
                        });

                        // Find all top scorers across games
                        const topScorers = filteredLeaderboard.filter(d => {
                            const score = Number(d.gamlescore ?? getTotalScore(d.gamename));
                            return score === gameBestScores[d.gamename];
                        });

                        // Yesterday's sheriff check
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];

                        const yesterdayScores = filteredLeaderboard.filter(entry =>
                            entry.createdat?.startsWith(yesterdayStr)
                        );
                        

                        const validYesterdayScores = yesterdayScores.filter(d => d.gamlescore !== undefined && d.gamlescore !== null);
                        const minScoreYesterday = validYesterdayScores.length > 0
                        ? Math.min(...validYesterdayScores.map(d => Number(d.gamlescore)))
                        : null;
                        const priorSheriffUsernames = validYesterdayScores
                        .filter(d => Number(d.gamlescore) === minScoreYesterday)
                        .map(d => d.username);
                       // Sheriff logic
                        let sheriffWinners = [];
                        
                        if (topScorers.length === 1) {
                        // Only one top scorer — auto sheriff
                        sheriffWinners = topScorers;
                        } else {
                        // Tie case
                        console.log('topScorers',topScorers);
                        const newSheriffs = topScorers.filter(user =>
                            !priorSheriffUsernames.includes(user.username) &&
                            topScorers.some(p => 
                            priorSheriffUsernames.includes(p.username) &&
                            Number(user.gamlescore ?? getTotalScore(user.gamename)) < Number(p.gamlescore ?? getTotalScore(p.gamename))
                            )
                        );
                        
                        if (newSheriffs.length > 0) {
                            sheriffWinners = newSheriffs;
                        } else {
                            // No one beat prior sheriff — retain them if tied
                            sheriffWinners = topScorers.filter(u => priorSheriffUsernames.includes(u.username));
                        }
                        }
                        const isSheriff = (username) =>
                        sheriffWinners.some(winner => winner.username === username);

                        return (
                            <>
                            <div className="d-flex align-items-center justify-content-center gap-3 cursor-pointer text-lg font-medium">
                                <button onClick={(e) => { e.stopPropagation(); goToPreviousDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                                <FaArrowLeft />
                                </button>
                                <div>{dayjs(startDate).format("MMM D, YYYY")}</div>
                                <button onClick={(e) => { e.stopPropagation(); goToNextDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                                <FaArrowRight />
                                </button>
                            </div>
                            <h4 className="text-center py-3">Daily Leaderboard</h4>

                            {filteredLeaderboard
                                .slice()
                                .sort((a, b) => {
                                const aScore = Number(a.gamlescore ?? getTotalScore(a.gamename));
                                const bScore = Number(b.gamlescore ?? getTotalScore(b.gamename));
                                return aScore - bScore;
                                })
                                .map((data, index) => {
                                const totalScore = getTotalScore(data.gamename);
                                const progressValue =
                                    totalScore > 0
                                    ? data.gamename === "connections"
                                        ? (data.gamlescore / totalScore) * 100
                                        : ((totalScore - data.gamlescore) / (totalScore - 1)) * 100
                                    : 0;

                                const minScore = gameBestScores[data.gamename];
                                const isSingleWinner = topScorers.length === 1 && topScorers[0].username === data.username;
                                const isSharedWinner = topScorers.length > 1 && topScorers.some(w => w.username === data.username);

                                const allLost =
                                    (data.gamename === 'connections' && minScore === 4) ||
                                    (data.gamename !== 'connections' && minScore === 7);

                                const worldCupScore = allLost ? 0 : (isSingleWinner ? 3 : isSharedWinner ? 1 : 0);
                                const pesceScore = allLost ? 0 : (isSingleWinner || isSharedWinner ? 1 : 0);

                                return (
                                    <Row
                                    key={index}
                                    className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                    >
                                    <Col xs={3} className="d-flex align-items-center gap-2">
                                        <div onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                        <img
                                            src={
                                            data.avatar
                                                ? `${baseURL}/user/uploads/${data.avatar}`
                                                : `${baseURL}/user/uploads/default_avatar.png`
                                            }
                                            alt="Profile"
                                            className="rounded-circle mb-1"
                                            style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                        />
                                        </div>
                                    </Col>

                                    <Col xs={4} className="text-start fw-semibold" onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                        {data.username}
                                    </Col>

                                    <Col xs={5}>
                                        <Row className="align-items-center">
                                        <Col xs={7}>
                                            <ProgressBar
                                            className={`${data.gamename}-progressbar`}
                                            variant="success"
                                            now={
                                                scoringmethod === "Golf"
                                                ? data.gamlescore ?? totalScore
                                                : scoringmethod === "World Cup"
                                                    ? worldCupScore
                                                    : scoringmethod === "Pesce"
                                                    ? pesceScore
                                                    : (data.gamlescore ?? totalScore)
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
                                                ? (data.gamlescore ?? '') === '' ? totalScore : data.gamlescore
                                                : scoringmethod === "World Cup"
                                                ? worldCupScore
                                                : pesceScore}
                                            {scoringmethod === "Pesce" && isSheriff(data.username) && Number(data.gamlescore) !== 0 && " 🤠"}
                                            {scoringmethod !== "Pesce" && isSingleWinner && " 🏆"}
                                            </span>
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
                  
                        {cumulativeDailyScore &&
                        cumulativeDailyScore.length > 0 &&
                        cumulativeDailyScore.some(data => data.gamlescore !== undefined && !isNaN(Number(data.gamlescore)) && data.username ) ? (
                            <>
                                {(() => {
                                    const filteredScores = cumulativeDailyScore.filter(
                                        data =>
                                            data.gamlescore !== undefined &&
                                            !isNaN(Number(data.gamlescore)) &&
                                            data.username &&
                                            String(data?.is_paused) === "0"
                                    );
                                    const minScore = Math.min(...filteredScores.map(data => Number(data.gamlescore)));
                                    const winners = filteredScores.filter(data => Number(data.gamlescore) === minScore);
    
                                    return filteredScores
                                        .slice()
                                        .sort((a, b) => {
                                            const aScore = Number(a.gamlescore ?? getTotalScore(a.gamename));
                                            const bScore = Number(b.gamlescore ?? getTotalScore(b.gamename));

                                            const allLost = minScore === 7;

                                            const isSingleWinnerA = winners.length === 1 && winners[0].username === a.username;
                                            const isSharedWinnerA = winners.length > 1 && winners.some(w => w.username === a.username);
                                            const worldCupScoreA = allLost ? 0 : (isSingleWinnerA ? 3 : isSharedWinnerA ? 1 : 0);
                                            const pesceScoreA = allLost ? 0 : (isSingleWinnerA || isSharedWinnerA ? 1 : 0);

                                            const isSingleWinnerB = winners.length === 1 && winners[0].username === b.username;
                                            const isSharedWinnerB = winners.length > 1 && winners.some(w => w.username === b.username);
                                            const worldCupScoreB = allLost ? 0 : (isSingleWinnerB ? 3 : isSharedWinnerB ? 1 : 0);
                                            const pesceScoreB = allLost ? 0 : (isSingleWinnerB || isSharedWinnerB ? 1 : 0);

                                            if (scoringmethod === "Golf") {
                                                return aScore - bScore; // lower is better
                                            } else if (scoringmethod === "World Cup") {
                                                return worldCupScoreB - worldCupScoreA; // higher World Cup score is better
                                            } else if (scoringmethod === "Pesce") {
                                                return pesceScoreB - pesceScoreA; // higher Pesce score is better
                                            } else {
                                                return bScore - aScore; // default: higher is better
                                            }
                                        })

                                        .map((data, index) => {
                                            const totalScore = getTotalScore(data.gamename);
                                            const incrementScore = (index + 1) * totalScore;
    
                                            const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                            const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);
                                            const worldCupScore = isSingleWinner ? 3 : isSharedWinner ? 1 : 0;
                                            const pesceScore = isSharedWinner ? 1 : 0;
                                            let nowValue = 0;
                                            let maxValue = 1; // default to 1 to avoid div-by-zero

                                            if (scoringmethod === "Golf") {
                                                nowValue = Number(data.gamlescore ?? totalScore);
                                                maxValue = totalScore > 0 ? totalScore : 1;
                                            } else if (scoringmethod === "World Cup") {
                                                nowValue = Number(data.total_worldcup_points ?? 0);
                                                maxValue = data.totalGamesPlayed * 7; // max world cup points (3 for win)
                                            } else if (scoringmethod === "Pesce") {
                                                nowValue = Number(data.total_pesce_points ?? 0);
                                                maxValue = data.totalGamesPlayed * 7; // max pesce score (1 for win/shared)
                                            }
                                            return (
                                                <Row
                                                    key={index}
                                                    className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm"
                                                >
                                                    <Col xs={3} className="d-flex align-items-center gap-2">
                                                        {/* <img
                                                            src={
                                                                data.avatar
                                                                    ? `${baseURL}/user/uploads/${data.avatar}`
                                                                    : `${baseURL}/user/uploads/default_avatar.png`
                                                            }
                                                            alt="Avatar"
                                                            className="rounded-circle border"
                                                            style={{ width: "35px", height: "35px", objectFit: "cover" }}
                                                        /> */}
                                                        <div onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                            <img
                                                                src={
                                                                data.avatar
                                                                    ? `${baseURL}/user/uploads/${data.avatar}`
                                                                    : `${baseURL}/user/uploads/default_avatar.png`
                                                                }
                                                                alt="Profile"
                                                                className="rounded-circle mb-1"
                                                                style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    </Col>
    
                                                    <Col xs={4} className="text-start fw-semibold" onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                        {data.username}
                                                    </Col>
    
                                                    <Col xs={5}>
                                                        <Row className="align-items-center">
                                                            <Col xs={7}>
                                                                {/* <ProgressBar
                                                                    className={`${data.gamename}-progressbar`}
                                                                    variant="success"
                                                                    now={data.gamlescore}
                                                                    max={totalScore + incrementScore}
                                                                    style={{ height: "8px" }}
                                                                /> */}
                                                                
                                                                {/* {data.gamlescore}({data.totalGamesPlayed * totalScore}) */}
                                                                
                                                                <ProgressBar
                                                                className={`${data.gamename}-progressbar`}
                                                                variant="success"
                                                                now={nowValue}
                                                                max={maxValue}
                                                                style={{ height: "8px" }}
                                                                />

                                                            </Col>
                                                            <Col xs={3} className="text-center fw-bold">
                                                            {scoringmethod === "Golf"
                                                                ? (data.gamlescore ?? totalScore)
                                                                : scoringmethod === "World Cup"
                                                                ? data.total_worldcup_points
                                                                : data.total_pesce_points}
                                                            </Col>

                                                        </Row>
                                                    </Col>
                                                </Row>
                                            );
                                        });
                                })()}

                                {latestJoinDate && (
                                <p className="text-center">
                                    Start Date: {(() => {
                                    const date = new Date(latestJoinDate);
                                    const dateString = date.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    });

                                    const isPM = date.getHours() >= 12;
                                    if(game === 'phrazle'){
                                        return `${dateString} ${isPM ? '- PM' : '- AM'}`;
                                    }
                                    else{
                                        return `${dateString}`;
                                    }
                                    })()}

                                    </p>
                                )}
                            </>
                        ) : (
                            <Alert variant="info" className="text-center">
                                😕 No results found for this leaderboard.
                            </Alert>
                        )}
                    </Col>
                </Row>
                {/* <Row className="justify-content-center leaderboard mt-4">
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
                </Row>                    */}

                </>
            ) : (
                dataFetched && (
                    <Alert key='danger' variant='danger' className='p-1'>
                        No data found for the selected date.
                    </Alert>
                )
            )}

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
                                <div className='today text-center fs-6 my-2 fw-bold'>{todayDate} - {period}</div>
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
                        <div className="text-center">
                            <h5>{noDataMessage}</h5>
                            <h6 className="text-muted">No Play</h6>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                    </Button>
                </Modal.Footer>
                </Modal>

        </>
        
    );
}

export default GroupScoreByDate;
