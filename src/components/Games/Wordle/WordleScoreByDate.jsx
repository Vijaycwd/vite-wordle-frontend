import React, { useState, forwardRef } from 'react';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";

function WordleScoreByDate() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const loginuserName =  USER_AUTH_DATA.username;
    const [selectedDate, setSelectedDate] = useState(null);
    const [statsChart, setStatsChart] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [dataFetchedError, setFetchedError] = useState(false);
    const [startDate, setStartDate] = useState(new Date());

    // Function to format the selected date in YYYY-MM-DD format for backend
    const formatDateForBackend = (date) => moment(date).format('YYYY-MM-DD');

    // Handle date selection
    const handleDateChange = (date) => {
        setStartDate(date);
        const formattedDate = formatDateForBackend(date);
        fetchDataByDate(formattedDate);  // Trigger data fetching after date selection
    };

    const fetchDataByDate = async (date) => {
        try {
            const timeZone = moment.tz.guess();
            
            const params = {
                userename: loginuserName,
                useremail: loginuserEmail,
                formattedYesterday: date,
                today: date,
                timeZone: timeZone
            };
    
            const [missedScoreResponse, todayResponse] = await Promise.all([
                axios.get(`https://coralwebdesigns.com/college/wordgamle/games/wordle/auto-submit-wordle-scores.php`, { params }),
                axios.get(`https://coralwebdesigns.com/college/wordgamle/games/wordle/get-score.php`, { params }),
            ]);
            console.log('todayResponse',todayResponse.data.wordlescore);

            if(todayResponse.data.status === "success"){

                setStatsChart(todayResponse.data.wordlescore);
            }
            else {
                setStatsChart([]);
                setFetchedError(true);
            }
            setDataFetched(true);
    
        } catch (error) {
            console.error("API Error:", error);
            setStatsChart([]);
            setFetchedError(true);
            setDataFetched(true);
        }
    };

    // Function to slice the string into rows of a specified length
    const splitIntoRows = (inputString, rowLength) => {
        const rows = [];
        const charArray = Array.from(inputString);
        for (let i = 0; i < charArray.length; i += rowLength) {
            rows.push(charArray.slice(i, i + rowLength).join(''));
        }
        return rows;
    };

    // Format createdAt to display as DD-MM-YYYY
    const formatCreatedAt = (createdat) => moment(createdat).format('DD-MMM-YYYY');

    // const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    //     <Button className="example-custom-input wordle-btn px-5 btn btn-primary" onClick={onClick} ref={ref}>
    //         Go To Date
    //     </Button>
    // ));
    const goToPreviousDay = () => {
            const prevDate = dayjs(startDate).subtract(1, 'day').toDate();
            handleDateChange(prevDate);
        };
        
    const goToNextDay = () => {
        const nextDate = dayjs(startDate).add(1, 'day');
        const today = dayjs().subtract(1, 'day').startOf('day');
        if (nextDate.isAfter(today, 'day')) return;
        handleDateChange(nextDate.toDate());
    };
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => {
            const parsedDate = dayjs(value, "DD-MM-YYYY");
    
        return (
            <>
                <Button className={`example-custom-input px-5 btn btn-primary wordle-btn`} onClick={onClick} ref={ref}>
            Go To Date
        </Button>
            
        
            </>
        );
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
                    maxDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                />
            </div>
            <ul className='score-by-date p-2'>
                {dataFetched && statsChart.length > 0 ? (
                    statsChart.map(item => {
                        const gamleScore = item.gamlescore;
                        const cleanedScore = item.wordlescore.replace(/[🟩🟨⬜⬛]/g, "");
                        const lettersAndNumbersRemoved = item.wordlescore.replace(/[a-zA-Z0-9,/\\]/g, "");
                        const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                        const wordleScores = splitIntoRows(removespace, 5);
                        const gamePlayed = item.gamePlayed;
                       
                        return (
                            <li key={item.createdat}>
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
                                <div className='text-center'>
                                    <h6 className='text-center pt-3'>Gamle Score: {gamleScore}</h6>
                                    {gamePlayed === 'no' ||  cleanedScore === 'X/6' ?(
                                        <p className='text-muted'>No Play</p>
                                        ) : (
                                        <>
                                            <p className='m-0'><strong>{item.username}</strong></p>
                                            <p className='m-1'>{cleanedScore}</p>
                                            <p className='my-1'>{formatCreatedAt(item.createdat)}</p>
                                            {wordleScores.map((row, rowIndex) => (
                                            <p className='m-1' key={rowIndex}>{row}</p>
                                            ))}
                                        </>
                                    )}

                                </div>
                            </li>
                        );
                    })
                ) : (
                    dataFetched && (
                        <Alert key='danger' variant='danger' className='p-1'>
                            No data found for the selected date.
                        </Alert>
                    )
                )}
            </ul>
        </>
    );
}

export default WordleScoreByDate;
