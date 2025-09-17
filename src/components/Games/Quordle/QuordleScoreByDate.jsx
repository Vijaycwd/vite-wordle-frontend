import React, { useState, forwardRef, useEffect } from 'react';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";

function QuordleScoreByDate() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [selectedDate, setSelectedDate] = useState(null);
    const [statsChart, setStatsChart] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [dataFetchedError, setFetchedError] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));

    // Function to format the selected date in YYYY-MM-DD format for backend
    const formatDateForBackend = (date) => moment(date).format('YYYY-MM-DD');

    // Handle date selection
    const handleDateChange = (date) => {
        setStartDate(date);
        const formattedDate = formatDateForBackend(date);
        fetchDataByDate(formattedDate);  // Trigger data fetching after date selection
    };

    useEffect(() => {
        const formattedDate = formatDateForBackend(startDate);
        fetchDataByDate(formattedDate);
    }, []);

    const fetchDataByDate = (date) => {
        const timeZone = moment.tz.guess(); // Automatically get the user's local time zone
    
        // Make the API request to the endpoint with date and timeZone as query parameters
        axios.get(`${baseURL}/games/quordle/get-score.php`, {
            params: {
                useremail: loginuserEmail,
                today: date,
                timeZone: timeZone
            }
        })
        .then((response) => {
            if (response.data.status === "success") {
                setStatsChart(response.data.quordlescore);
                setDataFetched(true);
                setFetchedError(false);
            } else {
                setStatsChart([]);
                setDataFetched(true);
                setFetchedError(true);
            }
        })
        .catch((error) => {
            setStatsChart([]);
            setDataFetched(true);
            setFetchedError(true);
        });
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
    const formatCreatedAt = (createdat) => moment(createdat).format('MMM D, YYYY');

    // const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    //     <Button className="example-custom-input Quordle-btn px-5 btn btn-primary" onClick={onClick} ref={ref}>
    //         Go To Date
    //     </Button>
    // ));

    const goToPreviousDay = () => {
        const prevDate = dayjs(startDate).subtract(1, 'day').toDate();
        handleDateChange(prevDate);
    };
    
    const goToNextDay = () => {
        const nextDate = dayjs(startDate).add(1, 'day');
        const today = dayjs().startOf('day');
        if (!nextDate.isBefore(today)) return; // stop if nextDate is today or after
        handleDateChange(nextDate.toDate());
    };

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => {
            const parsedDate = dayjs(value, "DD-MM-YYYY");

        return (
            <>
                <Button className={`example-custom-input px-5 btn btn-primary Quordle-btn`} onClick={onClick} ref={ref}>
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
                {dataFetched && (
                <>
                    <div className="d-flex align-items-center justify-content-center gap-3 cursor-pointer text-lg font-medium py-4">
                        <button onClick={(e) => { e.stopPropagation(); goToPreviousDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                            <FaArrowLeft />
                        </button>
                        <div>
                            {dayjs(startDate).format("MMM D, YYYY")}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); goToNextDay(); }} className="bg-dark text-white px-3 py-1 rounded">
                            <FaArrowRight />
                        </button>
                    </div>

                    {statsChart.length > 0 ? (
                        statsChart.map((item, index) => {
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
                        })
                    ) : (
                        <div>
                            <h6 className='text-center'>Gamle Score: 4</h6>
                            <p className='text-muted text-center'>No Play</p>
                        </div>
                    )}
                </>
            )}

            </ul>
        </>
    );
}

export default QuordleScoreByDate;
