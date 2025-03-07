import React, { useState, forwardRef } from 'react';
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
                <Col md={4} className="text-center">
                {dataFetched ? (
                    allLeaderboardArray.length > 0 ? (
                                <>
                                <h4 className="py-3">Cumulative Leaderboard</h4>
                                {allLeaderboardArray
                                    .slice()
                                    .sort((a, b) => b.gamlescore - a.gamlescore)
                                    .map((data, index) => {
                                        const totalScore = getTotalScore(data.gamename);
                                        
                                        return (
                                            
                                            <Row key={index} className="justify-content-center align-items-center py-1">
                                                <p className='my-1 py-3'><strong>{formatCreatedAt(data.createdat)}</strong></p>
                                                <Col md={8} xs={8}>
                                                   <ProgressBar 
                                                    now={
                                                        totalScore > 0 
                                                        ? data.gamename === "connections"
                                                            ? (1 - data.gamlescore / totalScore) * 100  // 0 is best for Connections
                                                            : ((totalScore - data.gamlescore) / (totalScore - 1)) * 100  // 1 is best, 6 is worst for Wordle
                                                        : 0
                                                    } 
                                                    className={`${data.gamename}-progressbar`}
                                                    />
                                                </Col>
                                                <Col md={4} xs={4}>
                                                    {/* {data.username} ({data.gamlescore}/{data.totalScore}) */}
                                                    {data.username} ({data.gamlescore})
                                                </Col>
                                            </Row>
                                        );
                                

                                    })}
                            </>
                    ) : (
                        <Alert key='danger' variant='danger' className='p-1 text-center'>
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
