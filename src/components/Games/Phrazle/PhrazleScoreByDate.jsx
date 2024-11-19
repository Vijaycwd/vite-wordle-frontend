import React, { useState, forwardRef } from 'react';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';

function PhrazleScoreByDate() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
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

    const fetchDataByDate = (date) => {
        const timeZone = moment.tz.guess(); // Automatically get the user's local time zone
    
        // Make the API request to the endpoint with date and timeZone as query parameters
        axios.get(`https://coralwebdesigns.com/college/wordgamle/games/phrazle/get-score.php`, {
            params: {
                useremail: loginuserEmail,
                date: date,
                timeZone: timeZone
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
        .catch((error) => {
            setStatsChart([]);
            setDataFetched(true);
            setFetchedError(true);
        });
    };

    // Function to slice the string into rows of a specified length
    function splitIntoRows(text) {
        return text.split(/\r\s*\r/);
    }
    // Format createdAt to display as DD-MM-YYYY
    

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <Button className="example-custom-input phrazle-btn px-5 btn btn-primary" onClick={onClick} ref={ref}>
            Go To Date
        </Button>
    ));

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
            <ul className='score-by-date p-2'>
                {dataFetched && statsChart.length > 0 ? (
                    statschart.map((char, index) => {
                        const cleanedScore = char.phrazlescore.replace(/[🟨,🟩,🟦,🟪,⬜]/g, "");
                        const phrasle_score_text = cleanedScore.replace(/#phrazle|https:\/\/solitaired.com\/phrazle/g, '');
                        const lettersAndNumbersRemoved = char.phrazlescore.replace(/[a-zA-Z0-9,#:./\\]/g, "");
                        console.log(lettersAndNumbersRemoved);
                        const phrazleScore = splitIntoRows(lettersAndNumbersRemoved);
                        // const phrazleScore = splitIntoRows(removespace, 10);
                        const createDate = char.createdat; // Ensure this matches your database field name
                        const date = new Date(createDate);
                        const todayDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                        const gamleScore = char.gamlescore;
                        return (
                            <div key={index}>
                                <h5 className='text-center'>Game Score: {gamleScore}</h5>
                                <div className={`phrazle-score-board-text my-3 fs-5 text-center`}>{phrasle_score_text}</div>
                                <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                                <div className='text-center'>
                                    {phrazleScore.map((row, rowIndex) => (
                                        <div key={rowIndex}>{row}</div>
                                    ))}
                                </div>
                            </div>
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

export default PhrazleScoreByDate;
