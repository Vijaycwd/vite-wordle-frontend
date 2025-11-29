import React, { useEffect, useState, forwardRef } from 'react';
import { useParams, useSearchParams  } from "react-router-dom";
import axios from 'axios';
import { Button, Alert, Row, Col, ProgressBar, Modal  } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";
import GetGroupMessagesModal from '../../constant/Models/GetGroupMessagesModal';

function MessageLeaderboard({ latestJoinDate, setSelectedMember, setShowProfile, msgReportDate, msgPeriod, groupId, groupName, gameName}) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const [messageLeaderboard, setMessageLeaderboard] = useState([]);
    // const [latestJoinDate, setlatestJoinDate] = useState('');
    const [totalGames, settotalGames] = useState('');
    const [cumulativeAverageScore, setcumulativeAverageScore] = useState([]);
    const [cumulativeDailyScore, setcumulativeDailyScore] = useState([]);
    const [missedScore, setMissedScore] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [dataFetchedError, setFetchedError] = useState(false);
    const [scoringMethod, setscoringMethod] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [dayResults, setDayResults] = useState(null);
    const [selectedGame, setSelectedGame] = useState("");
    const [period, setPeriod] = useState('');
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;
    const loginuserEmail = USER_AUTH_DATA?.email;
    //const formattedDate = latestJoinDate.slice(0, 10);
    const formattedDateStr = latestJoinDate ? latestJoinDate.slice(0, 10) : null;
    const date = new Date(latestJoinDate);
    const hours = date.getHours();
    const groupPeriod = hours < 12 ? "AM" : "PM";
    let minDate = new Date(); // fallback

    if (formattedDateStr && typeof formattedDateStr === 'string') {
        const parts = formattedDateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts.map(Number);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                // Use UTC to avoid timezone shift issues
                minDate = new Date(Date.UTC(year, month - 1, day));
            } else {
                console.error('Invalid date parts:', { year, month, day });
            }
        } else {
            console.error('Unexpected date format:', formattedDateStr);
        }
    }
    //console.log('minDate:', minDate.toISOString());


    const minDateStr = minDate.toISOString().split('T')[0];
    

    useEffect(() => {
        const fetchscoringMethod = async () => {
            try {
                const res = await axios.get(`${baseURL}/groups/get-scoring-method.php`, {
                    params: { user_id: userId, group_id: groupId }
                });

                if (res.data.status == "success") {
                    
                    setscoringMethod(res.data.scoring_method); // Default to empty string
                } else {
                    toast.error("Scoring Method not found.");
                }
            } catch (err) {
                toast.error("Failed to load group info.");
            }
        };

        if (groupId && userId) {  
            fetchscoringMethod();
        }
    }, [groupId, userId]); 

    const formatDateForBackend = (date) => {
        if (!date) return "";
        const m = moment(date);
        if (!m.isValid()) return "";
        return m.format("YYYY-MM-DD");
    };
   


    const showDayResult = (date, useremail, gameName, period) => {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        const timeZone = moment.tz.guess();
        const params = { useremail, timeZone, today: formattedDate };

        if (gameName === "phrazle") {
            params.period = period;
        }

        axios.get(`${baseURL}/games/${gameName}/get-score.php`, { params })
            .then((response) => {
                let scoreData = [];

                if (gameName === "wordle") {
                    scoreData = response.data?.wordlescore || [];
                } else if (gameName === "connections") {
                    scoreData = response.data?.connectionsscore || [];
                } else if (gameName === "phrazle") {
                    scoreData = response.data?.phrazlescore || [];
                }
                else if (gameName === "quordle") {
                    scoreData = response.data?.quordlescore || [];
                }

                setDayResults(scoreData);
                setShowModal(true);
            })
            .catch((error) => {
                console.error(`API Error for ${gameName}:`, error);
            });
    };

    
    useEffect(() => {
        if (!scoringMethod || !gameName) return;

        const now = dayjs();
        const currentHour = now.hour();

        if (gameName === 'phrazle') {
            let date, period;

            if (currentHour < 12) {
                date = now.subtract(1, 'day').toDate();
                period = 'PM';
            } else {
                date = now.toDate();
                period = 'AM';
            }

            const currrentDate = formatDateForBackend(date);
            if (currrentDate >= formattedDateStr) {
                if(msgReportDate){
                    setStartDate(msgReportDate); // Pass Date object
                    setPeriod(msgPeriod);
                }
                else{
                    setStartDate(date); // Pass Date object
                    setPeriod(period);
                }
                fetchDataByDate(currrentDate, period);
            }

        } else {
            const prevDate = now.subtract(1, 'day').toDate();
            const prevDateStr = formatDateForBackend(prevDate);
            if (prevDateStr >= formattedDateStr) {
                if(msgReportDate){
                    setStartDate(msgReportDate);
                }
                else{
                    setStartDate(prevDate);
                }
                fetchDataByDate(prevDateStr);
            }
        }
    }, [scoringMethod, gameName]);



    const fetchDataByDate = async (date, currentPeriod = null) => {
        try {
            const timeZone = moment.tz.guess();

            const baseParams = {
                groupId: groupId,
                groupName,
                game: gameName,
                groupCreatedDate: formattedDateStr,
                groupPeriod: msgPeriod || groupPeriod,
                today: msgReportDate || date,
                timeZone,
                formattedYesterday: date,
                scoringMethod
            };

            const params = gameName === 'phrazle'
                ? { ...baseParams, period: currentPeriod || period }
                : baseParams;

            let todayResponse, cumulativeAverageResponse, cumulativeDailyResponse;
            
            if (scoringMethod === 'Pesce') {
                const todayPromise = axios.get(`${baseURL}/groups/pesce-get-group-score.php`, { params });

                // Wait 300ms before firing the other two
                await new Promise(resolve => setTimeout(resolve, 300));

                const cumulativeAveragePromise = axios.get(`${baseURL}/groups/get-cumulative-average-score.php`, { params });
                const cumulativeDailyPromise = axios.get(`${baseURL}/groups/get-cumulative-score-bydate.php`, { params });

                [todayResponse, cumulativeAverageResponse, cumulativeDailyResponse] = await Promise.all([
                    todayPromise,
                    cumulativeAveragePromise,
                    cumulativeDailyPromise
                ]);
            }
            else {
                [todayResponse, cumulativeAverageResponse, cumulativeDailyResponse] = await Promise.all([
                    axios.get(`${baseURL}/groups/get-group-score.php`, { params }),
                    axios.get(`${baseURL}/groups/get-cumulative-average-score.php`, { params }),
                    axios.get(`${baseURL}/groups/get-cumulative-score-bydate.php`, { params }),
                ]);
            }

            if (
                todayResponse.data.status === "success" &&
                Array.isArray(todayResponse.data.data)
            ) {
                setMessageLeaderboard(todayResponse.data.data);
            } else {
                setMessageLeaderboard([]);
                setFetchedError(true);
            }

            settotalGames(cumulativeDailyResponse.data.totalGames || []);
            setcumulativeAverageScore(cumulativeAverageResponse.data.data || []);
            setcumulativeDailyScore(cumulativeDailyResponse.data.data || []);
            setDataFetched(true);

        } catch (error) {
            console.error("API Error:", error);
            setMessageLeaderboard([]);
            setFetchedError(true);
            setDataFetched(true);
        }
    };

    // Function to get the max possible score for a game
    const getTotalScore = (gameName) => {
        const cleanedName = gameName ? gameName.trim().toLowerCase() : "";
        return cleanedName === "wordle" ? 7 :
            cleanedName === "connections" ? 4 :
            cleanedName === "phrazle" ? 7 :
            cleanedName === "quordle" ? 31 :
            1; // Default to 1 if unknown
    };




    const handleCloseModal = () => {
        setShowModal(false);
        // if (updated) fetchGroupInfo();
    };

    const now = new Date();

    let maxSelectableDate;

    if (gameName === "phrazle") {
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
    phrazle: "Gamle Score 7",
    quordle: "Gamle Score 31"
    }[gameName] || "No data available.";

    
   // COMMON date/time
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Helper
    const formatLocalDateTime = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
            + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    let todayFormatted = "";
    let yesterdayFormatted = "";

    // ⭐ CORRECT GAME LOGIC
    if (gameName === "phrazle") {
        // Phrazle needs ONLY the selected date (YYYY-MM-DD)
        todayFormatted = dayjs(startDate).format("YYYY-MM-DD");
        yesterdayFormatted = ""; // Not used
    } else {
        // Wordle / Connections use yesterday
        todayFormatted = formatLocalDateTime(today);
        yesterdayFormatted = formatLocalDateTime(yesterday);
    }

    useEffect(() => {
        if (!USER_AUTH_DATA?.id) return;

        const params = { 
            baseURL: baseURL,
            user_id: USER_AUTH_DATA.id,  
            today: todayFormatted,
        };

        if (gameName !== "phrazle") {
            params.yesterday = yesterdayFormatted;
        }

        if (gameName === "phrazle") {
            params.period = period; // AM / PM
        }

        axios.get(`${baseURL}/user/get-day-winner.php`, { params })
            .then((res) => {
                if (res.data.success) {
                    console.log(res.data.groups);
                }
            })
            .catch((err) => console.error("Error fetching groups:", err));

    }, [USER_AUTH_DATA?.id, gameName, period, todayFormatted, yesterdayFormatted]);


    console.log("MLB → msgReportDate:", msgReportDate);
    console.log("MLB → msgPeriod:", msgPeriod);
    console.log("MLB → groupId:", groupId);
    console.log("MLB → groupName:", groupName);
    console.log("MLB → gameName:", gameName);
    
    return (
        <>
            
            <Row className="justify-content-center leaderboard">
                <Col md={5} className="text-center">
                    {dataFetched && messageLeaderboard.length > 0 ? (
                        <>
                        {messageLeaderboard.length > 0 && (() => {
                            // Filter out only "phrazle" and valid players
                            const filteredLeaderboard = messageLeaderboard.filter((data) => data.gamename === "phrazle" && String(data?.is_paused) === "0");
                            if (filteredLeaderboard.length === 0) return null;

                            const minScore = Math.min(
                                ...filteredLeaderboard.map(data => 
                                    Number(data.gamlescore ?? getTotalScore(data.gamename))
                                )
                            );

                            const winners = filteredLeaderboard.filter(data => 
                                Number(data.gamlescore ?? getTotalScore(data.gamename)) === minScore
                            );

                            const validYesterdayScores = filteredLeaderboard.filter(d => d.previous_gamlescore !== undefined && d.previous_gamlescore !== null);
                            const minScoreYesterday = validYesterdayScores.length > 0
                                ? Math.min(...validYesterdayScores.map(d => Number(d.previous_gamlescore)))
                                : null;

                            const priorSheriffUsernames = validYesterdayScores
                                .filter(d => Number(d.previous_gamlescore) === minScoreYesterday)
                                .map(d => d.username);

                            // Sheriff logic — only 1 sheriff
                            let sheriffWinners = [];
                            if (winners.length === 1) {
                                sheriffWinners = [winners[0]];
                            } else {
                                const repeatingSheriffs = winners.filter(w => priorSheriffUsernames.includes(w.username));
                                if (repeatingSheriffs.length > 0) {
                                    sheriffWinners = [repeatingSheriffs[0]];
                                } else {
                                    const beatAllSheriffs = winners.filter(w => {
                                        return priorSheriffUsernames.every(p => {
                                            const prior = validYesterdayScores.find(x => x.username === p);
                                            return prior && Number(w.gamlescore ?? 7) < Number(prior.previous_gamlescore ?? 7);
                                        });
                                    });

                                    if (beatAllSheriffs.length === 1) {
                                        sheriffWinners = [beatAllSheriffs[0]];
                                    } else if (priorSheriffUsernames.length === 0) {
                                        sheriffWinners = [winners[0]];
                                    }
                                }
                            }

                            const isSheriff = (username) =>
                            messageLeaderboard.some(user => user.username === username && user.sheriff === true);

                            const latest = dayjs(latestJoinDate);
                            const latestDateOnly = latest.startOf('day');
                            const joinPeriod = latest.hour() < 12 ? 'AM' : 'PM';

                            // Minimum limit for backward navigation
                            const isMinPhrazleDate =
                                (period === 'AM' && dayjs(startDate).isSame(latestDateOnly, 'day') && joinPeriod === 'AM') ||
                                (period === 'PM' && dayjs(startDate).isSame(latestDateOnly, 'day') && joinPeriod === 'PM');

                            const now = dayjs();
                            const currentHour = now.hour();

                            let maxDateKey = '';
                            if (currentHour < 12) {
                            // Before noon → max = yesterday PM
                            const maxDate = now.subtract(1, 'day').format('YYYY-MM-DD');
                            maxDateKey = `${maxDate}-PM`;
                            } else {
                            // After noon → max = today AM
                            const maxDate = now.format('YYYY-MM-DD');
                            maxDateKey = `${maxDate}-AM`;
                            }

                            // Selected key
                            const selectedDateStr = dayjs(startDate).format('YYYY-MM-DD');
                            const selectedKey = `${selectedDateStr}-${period}`;

                            // Disable if selected date-period is same or after max allowed
                            const isMaxPhrazleDate = selectedKey >= maxDateKey;

                            // const isMaxPhrazleDate = (period === 'AM' && dayjs(startDate).isSame(dayjs(), 'day'));
                            return (
                                <>
                                <div className="d-flex align-items-center justify-content-center gap-3 cursor-pointer text-lg font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); goToPreviousDay(); }} disabled={isMinPhrazleDate} className="bg-dark text-white px-3 py-1 rounded">
                                        <FaArrowLeft />
                                    </button>
                                    <div>
                                        {dayjs(startDate).format("MMM D, YYYY")} - {period}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); goToNextDay(); }} disabled={isMaxPhrazleDate} className="bg-dark text-white px-3 py-1 rounded">
                                        <FaArrowRight />
                                    </button>
                                </div>
                                <h4 className="text-center py-3">Daily Leaderboard</h4>

                                {filteredLeaderboard.slice().sort((a, b) => {
                                    const aIsSheriff = isSheriff(a.username) ? 1 : 0;
                                    const bIsSheriff = isSheriff(b.username) ? 1 : 0;
                                    if (aIsSheriff !== bIsSheriff) return bIsSheriff - aIsSheriff;

                                    const aScore = Number(a.gamlescore ?? getTotalScore(a.gamename));
                                    const bScore = Number(b.gamlescore ?? getTotalScore(b.gamename));

                                    const allLost = minScore === 7;

                                    const isSingleWinnerA = winners.length === 1 && winners[0].username === a.username;
                                    const isSharedWinnerA = winners.length > 1 && winners.some(w => w.username === a.username);
                                    const worldCupScoreA = allLost ? 0 : (isSingleWinnerA ? 3 : isSharedWinnerA ? 1 : 0);
                                    const pesceScoreA = isSheriff(a.username) ? 1 : 0;

                                    const isSingleWinnerB = winners.length === 1 && winners[0].username === b.username;
                                    const isSharedWinnerB = winners.length > 1 && winners.some(w => w.username === b.username);
                                    const worldCupScoreB = allLost ? 0 : (isSingleWinnerB ? 3 : isSharedWinnerB ? 1 : 0);
                                    const pesceScoreB = isSheriff(b.username) ? 1 : 0;

                                    if (scoringMethod === "Golf") {
                                        return aScore - bScore;
                                    } else if (scoringMethod === "World Cup") {
                                        return worldCupScoreB - worldCupScoreA;
                                    } else if (scoringMethod === "Pesce") {
                                        if (aIsSheriff === 0 && bIsSheriff === 0) {
                                            return aScore - bScore;
                                        }
                                        return 0;
                                    } else {
                                        return bScore - aScore;
                                    }
                                }).map((data, index) => {
                                    const totalScore = getTotalScore(data.gamename);
                                    const progressValue = totalScore > 0
                                        ? data.gamename === "connections"
                                            ? (data.gamlescore / totalScore) * 100
                                            : ((totalScore - data.gamlescore) / (totalScore - 1)) * 100
                                        : 0;

                                    const isSingleWinner = winners.length === 1 && winners[0].username === data.username;
                                    const isSharedWinner = winners.length > 1 && winners.some(w => w.username === data.username);

                                    const allLost = minScore === 7;
                                    const worldCupScore = allLost ? 0 : (isSingleWinner ? 3 : isSharedWinner ? 1 : 0);
                                    const pesceScore = isSheriff(data.username) ? 1 : 0;

                                    return (
                                        <Row key={index} className="justify-content-between align-items-center py-2 px-3 mb-2 rounded bg-light shadow-sm">
                                            <Col xs={3} className="d-flex align-items-center gap-2">
                                                <div onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                    <img
                                                        src={data.avatar ? `${baseURL}/user/uploads/${data.avatar}` : `${baseURL}/user/uploads/default_avatar.png`}
                                                        alt="Profile"
                                                        className="rounded-circle mb-1"
                                                        style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            </Col>

                                            <Col xs={4} className="text-start fw-semibold" onClick={() => handleShowProfile(data)} style={{ cursor: 'pointer' }}>
                                                {data.username}
                                                {/* <p>Score is:{data.gamlescore}</p> */}
                                            </Col>

                                            <Col xs={5}>
                                                <Row className="align-items-center">
                                                    <Col md={7} xs={6} >
                                                        <ProgressBar
                                                            className={`${data.gamename}-progressbar`}
                                                            variant="success"
                                                            now={
                                                                scoringMethod === "Golf"
                                                                    ? data.gamlescore ?? totalScore
                                                                    : scoringMethod === "World Cup"
                                                                    ? worldCupScore
                                                                    : scoringMethod === "Pesce"
                                                                    ? pesceScore
                                                                    : (data.gamlescore ?? totalScore)
                                                            }
                                                            max={totalScore}
                                                            style={{ height: '8px' }}
                                                        />
                                                    </Col>
                                                    
                                                    <Col md={5} xs={6} className="text-center d-flex fw-bold">
                                                        <span
                                                            onClick={() => showDayResult(data.createdat, data.useremail, data.gamename, period)}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            {scoringMethod === "Golf"
                                                                ? (data.gamlescore ?? '') === '' ? totalScore : data.gamlescore
                                                                : scoringMethod === "World Cup"
                                                                ? worldCupScore
                                                                : pesceScore}
                                                            {data.gamename === 'phrazle' &&
                                                            scoringMethod === "Pesce" &&
                                                            isSheriff(data.username) &&
                                                            " 🤠"}
                                                            {scoringMethod !== "Pesce" && isSingleWinner && " 🏆"}
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


                        {/* Wordle, Connections */}

                        {messageLeaderboard.length > 0 && (() => {
                            const filteredLeaderboard = messageLeaderboard.filter((data) => data.gamename !== "phrazle" && String(data?.is_paused) === "0");
                            if (filteredLeaderboard.length === 0) return null;

                            // Group scores by game
                            const gameScoresMap = {};
                            filteredLeaderboard.forEach(d => {
                                const score = Number(d.gamlescore ?? getTotalScore(d.gamename));
                                if (!gameScoresMap[d.gamename]) gameScoresMap[d.gamename] = [];
                                gameScoresMap[d.gamename].push({ ...d, score });
                            });

                            // Prepare best scores per game
                            const gameBestScores = {};
                            Object.entries(gameScoresMap).forEach(([gamename, scores]) => {
                                const best = Math.min(...scores.map(s => s.score));
                                gameBestScores[gamename] = best;
                            });

                            // Find top scorers
                            const topScorers = filteredLeaderboard.filter(d => {
                                const score = Number(d.gamlescore ?? getTotalScore(d.gamename));
                                return score === gameBestScores[d.gamename];
                            });

                            // Define sheriff checker before using it
                            const isSheriff = (username) =>
                                messageLeaderboard.some(user => user.username === username && user.sheriff === true);
                        
                            return (
                                <>
                                <h4 className="text-center py-3">Leaderboard for {dayjs(startDate).format("MMM D, YYYY")}</h4>

                                {filteredLeaderboard
                                .slice()
                                .sort((a, b) => {
                                    const aIsSheriff = isSheriff(a.username) ? 1 : 0;
                                    const bIsSheriff = isSheriff(b.username) ? 1 : 0;
                                    if (aIsSheriff !== bIsSheriff) return bIsSheriff - aIsSheriff;

                                    const aScore = Number(a.gamlescore ?? getTotalScore(a.gamename));
                                    const bScore = Number(b.gamlescore ?? getTotalScore(b.gamename));
                                    return aScore - bScore;
                                })
                                .map((data, index) => {
                                    const totalScore = getTotalScore(data.gamename);
                                    
                                    const minScore = gameBestScores[data.gamename];
                                   
                                    const isQuordleValidScore =
                                        data.gamename === "quordle" ? data.gamlescore >= 10 && data.gamlescore <= 30 : true;
                                    
                                    const isSingleWinner =
                                        isQuordleValidScore &&
                                        topScorers.length === 1 &&
                                        topScorers[0].username === data.username;
                                    // console.log(isSingleWinner);

                                    const isSharedWinner =
                                        isQuordleValidScore &&
                                        topScorers.length > 1 &&
                                        topScorers.some(w => w.username === data.username);

                                    // 🔹 Support Wordle (7), Quordle (9), Connections (4)
                                    const allLost =
                                    (data.gamename === "connections" && minScore === 4) ||
                                    (data.gamename === "wordle" && minScore === 7) ||
                                    (data.gamename === "quordle" && (minScore === 9 || data.gamlescore < 10 || data.gamlescore > 30));

                                    const worldCupScore = allLost ? 0 : (isSingleWinner ? 3 : isSharedWinner ? 1 : 0);
                                    // const pesceScore = allLost ? 0 : (isSingleWinner || isSharedWinner ? 1 : 0);
                                    const pesceScore = allLost ? 0 : (isSheriff(data.username) ? 1 : 0);
                                    
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
                                            {/* <p>Score is:{data.gamlescore}</p> */}
                                            
                                        </Col>

                                        <Col xs={5}>
                                            <Row className="align-items-center">
                                            <Col md={7} xs={6}>
                                                <ProgressBar
                                                className={`${data.gamename}-progressbar`}
                                                variant="success"
                                                now={
                                                    scoringMethod === "Golf"
                                                    ? data.gamlescore ?? totalScore
                                                    : scoringMethod === "World Cup"
                                                        ? worldCupScore
                                                        : scoringMethod === "Pesce"
                                                        ? pesceScore
                                                        : (data.gamlescore ?? totalScore)
                                                }
                                                max={totalScore}
                                                style={{ height: '8px' }}
                                                />
                                            </Col>
                                            
                                            <Col md={5} xs={6} className="text-center d-flex fw-bold">
                                                <span
                                                    onClick={() => showDayResult(data.createdat, data.useremail, data.gamename)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {scoringMethod === "Golf"
                                                    ? (data.gamlescore ?? '') === '' ? totalScore : data.gamlescore
                                                    : scoringMethod === "World Cup"
                                                    ? worldCupScore
                                                    : pesceScore}
                                                    {/* Sheriff emoji for Wordle */}
                                                    {data.gamename === 'wordle' &&
                                                    scoringMethod === "Pesce" &&
                                                    isSheriff(data.username) &&
                                                    data.gamlescore !== null &&
                                                    data.gamlescore !== '' &&
                                                    Number(data.gamlescore) !== 7 &&
                                                    " 🤠"}

                                                    {/* Sheriff emoji for Connections */}
                                                    {data.gamename === 'connections' &&
                                                    scoringMethod === "Pesce" &&
                                                    isSheriff(data.username) &&
                                                    data.gamlescore !== null &&
                                                    data.gamlescore !== '' &&
                                                    Number(data.gamlescore) !== 4 &&
                                                    " 🤠"}

                                                    {/* Sheriff emoji for Quordle */}
                                                    {data.gamename === 'quordle' &&
                                                    scoringMethod === "Pesce" &&
                                                    isSheriff(data.username) &&
                                                    data.gamlescore !== null &&
                                                    data.gamlescore !== '' &&
                                                    Number(data.gamlescore) !== 9 && // max attempts per word
                                                    " 🤠"}

                                                    {/* Trophy for top scorer */}
                                                    {scoringMethod !== "Pesce" && isSingleWinner && " 🏆"}
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

                        if (gameName === 'phrazle') {
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
                        else if (gameName === 'wordle') {
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
                        else if (gameName === 'connections') {
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
                        else if (gameName === 'quordle') {
                        // Example Connection game display
                        const cleanedScore = item.quordlescore
                                .replace(/[🟨🟩⬛⬜🙂]/g, "") // remove tiles/emojis
                                .replace("m-w.com/games/quordle/", ""); // remove link

                            const quordleScore = item.quordlescore
                            .split("\n")                        // split into lines
                            .map(l => l.trim())                 // trim spaces
                            .filter(l => /^[⬛⬜🟨🟩 ]+$/.test(l)) // allow tiles + space
                            .join("\n");
                            //const quordleScore = splitIntoRows(lettersAndNumbersRemoved);
                            const createDate = item.createdat; // Ensure this matches your database field name
                            const date = new Date(createDate);
                            const todayDate = date.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            });
                            const gamleScore = item.gamlescore;
                            return (
                                
                                <div key={index}>
                                    <h5 className='text-center'>Gamle Score: {gamleScore}</h5>
                                    <>
                                    <div className={`wordle-score-board-text my-3 fs-5 text-center`}>{cleanedScore}</div>
                                    <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                                    <pre className='text-center'>
                                        {quordleScore}
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

export default MessageLeaderboard;