import React, { useState, forwardRef, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";

function PhrazleScoreByDate() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email;
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
    const [period, setPeriod] = useState('');
    const [statsChart, setStatsChart] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [dataFetchedError, setFetchedError] = useState(false);

    const formatDateForBackend = (date) => moment(date).format('YYYY-MM-DD hh:mm A');

    const fetchDataByDate = (date, periodValue) => {
        const timeZone = moment.tz.guess();
        const originalDate = moment.tz(date, "YYYY-MM-DD hh:mm A", timeZone);
        const formattedDate = originalDate.format("YYYY-MM-DDTHH:mm:ss");

        axios.get(`${baseURL}/games/phrazle/get-score.php`, {
            params: {
                useremail: loginuserEmail,
                today: formattedDate,
                timeZone: timeZone,
                period: periodValue
            }
        })
        .then((response) => {
            if (response.data.status === "success") {
                setStatsChart(response.data.phrazlescore);
                setDataFetched(true);
                setFetchedError(false);
            } else {
                setStatsChart([]);
                setDataFetched(true);
                setFetchedError(true);
            }
        })
        .catch(() => {
            setStatsChart([]);
            setDataFetched(true);
            setFetchedError(true);
        });
    };

    // useEffect(() => {
    //     const formattedDate = formatDateForBackend(startDate);
    //     fetchDataByDate(formattedDate, period);
    // }, [startDate, period]);

    const handleDateChange = (date) => {
        const newPeriod = 'AM';
        const formattedDate = formatDateForBackend(date); // Use selected date, not startDate
        fetchDataByDate(formattedDate, newPeriod);
        setStartDate(date);
        setPeriod(newPeriod);
    };
    
    const goToPreviousPeriod = () => {
        // console.log('goToPreviousPeriod',period)
        if (period === 'PM') {
            const newPeriod = 'AM';
            const formattedDate = formatDateForBackend(startDate);
            fetchDataByDate(formattedDate, newPeriod);
            setPeriod(newPeriod);
        } else {
            const prevDate = dayjs(startDate).subtract(1, 'day').toDate();
            const newPeriod = 'PM';
            const formattedDate = formatDateForBackend(prevDate);
            fetchDataByDate(formattedDate, newPeriod);
            setStartDate(prevDate);
            setPeriod(newPeriod);
        }
    };
    
    const goToNextPeriod = () => {
    const today = dayjs().startOf('day'); // Only allow dates before today
    const nextDate = dayjs(startDate).add(1, 'day');

    if (period === 'AM') {
        const newPeriod = 'PM';
        const isToday = dayjs(startDate).isSame(today, 'day');
        const isTodayPMBlocked = isToday && today.hour() < 12;

        if (isTodayPMBlocked) return;

        const formattedDate = formatDateForBackend(startDate);
        fetchDataByDate(formattedDate, newPeriod);
        setPeriod(newPeriod);
    } else {
        // if (!nextDate.isBefore(today)) return;
        const newPeriod = 'AM';
        const formattedDate = formatDateForBackend(nextDate.toDate());
        fetchDataByDate(formattedDate, newPeriod);
        setStartDate(nextDate.toDate());
        setPeriod(newPeriod);
    }
};

    

    const splitIntoRows = (text) => {
        const cleanedData = text.trim();
        const rows = cleanedData.split(/\n+/);
        return rows.map(row => row.replace(/\s+/g, ' ').trim());
    };

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <Button className="example-custom-input px-5 btn btn-primary phrazle-btn" onClick={onClick} ref={ref}>
            Go To Date
        </Button>
    ));

    const now = new Date();
    const isAfternoon = now.getHours() >= 12;

    const maxSelectableDate = isAfternoon
    ? new Date() // allow today
    : new Date(now.setDate(now.getDate() - 1));
    return (
        <>
            <div className='text-center'>
                <DatePicker
                    
                    onChange={handleDateChange}
                    customInput={<ExampleCustomInput />}
                    dateFormat="dd-MM-yyyy"
                    timeFormat="hh:mm aa"
                    timeIntervals={720}
                    maxDate={maxSelectableDate}
                    timeCaption="AM/PM"
                />
            </div>
            <ul className='score-by-date p-2'>
                
            {dataFetched && (
            <>
                <div className="d-flex align-items-center justify-content-center gap-3 cursor-pointer text-lg font-medium py-4">
                    <button onClick={(e) => { e.stopPropagation(); goToPreviousPeriod(); }} className="bg-dark text-white px-3 py-1 rounded">
                        <FaArrowLeft />
                    </button>
                    <div>
                        {dayjs(startDate).format("MMM D, YYYY")} - {period}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); goToNextPeriod(); }} className="bg-dark text-white px-3 py-1 rounded">
                        <FaArrowRight />
                    </button>
                </div>

                {statsChart.length > 0 ? (
                    statsChart.map((char, index) => {
                        const cleanedScore = char.phrazlescore.replace(/[🟨,🟩,🟦,🟪,⬜]/g, "");
                        const phrasle_score_text = cleanedScore.replace(/#phrazle|https:\/\/solitaired.com\/phrazle/g, '');
                        const lettersAndNumbersRemoved = char.phrazlescore.replace(/[a-zA-Z0-9,#:./\\]/g, "");
                        const phrazleScore = splitIntoRows(lettersAndNumbersRemoved);
                        const date = new Date(char.createdat);
                        const todayDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        });
                        const gamleScore = char.gamlescore;
                        const gamePlayed = char.gamePlayed;

                        return (
                            <div key={index}>
                            <h6 className='text-center'>Gamle Score: {gamleScore}</h6>
                            <div className='phrazle-score-board-text my-3 fs-5 text-center'>{phrasle_score_text}</div>
                            <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                            <div className='text-center'>
                                {phrazleScore.map((row, rowIndex) => {
                                    if (!row.trim()) return null;
                                    const symbols = row.split(' ');
                                    return (
                                        <div className="phrasle-row-score" key={rowIndex}>
                                            {symbols.map((part, partIndex) => (
                                                <div className="items" key={partIndex}>
                                                    {part}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        );
                    })
                ) : (
                    <div>
                        <h6 className='text-center'>Gamle Score: 7</h6>
                        <p className='text-muted text-center'>No Play</p>
                    </div>
                )}
            </>
        )}

            </ul>
        </>
    );
}

export default PhrazleScoreByDate;
