import React, { useState, forwardRef } from 'react';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';

function WordleScoreByDate() {
    const USER_AUTH_DATA = JSON.parse(sessionStorage.getItem('auth'));
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
        axios.get(`https://coralwebdesigns.com/college/wordgamle/games/wordle/get-score.php`, {
            params: {
                useremail: loginuserEmail,
                date: date,
                timeZone: timeZone
            }
        })
        .then((response) => {
            if (response.data.status === "success") {
                setStatsChart(response.data.wordlescore);
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
    const formatCreatedAt = (createdat) => moment(createdat).format('DD-MM-YYYY');

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <Button className="example-custom-input wordle-btn px-5 btn btn-primary" onClick={onClick} ref={ref}>
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
                    statsChart.map(item => {
                        const cleanedScore = item.wordlescore.replace(/[🟩🟨⬜]/g, "");
                        const lettersAndNumbersRemoved = item.wordlescore.replace(/[a-zA-Z0-9,/\\]/g, "");
                        const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                        const wordleScores = splitIntoRows(removespace, 5);
                        return (
                            <li key={item.createdat}>
                                <div className='text-center'>
                                    <p className='m-0'><strong>{item.username}</strong></p>
                                    <p className='m-1'>{cleanedScore}</p>
                                    <p className='my-1'>{formatCreatedAt(item.createdat)}</p>
                                    {wordleScores.map((row, rowIndex) => (
                                        <p className='m-1' key={rowIndex}>{row}</p>
                                    ))}
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
