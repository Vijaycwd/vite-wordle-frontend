import React, { useState, useRef, forwardRef, useEffect } from 'react';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';

function WordleScoreByDate() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [userEmail] = useState(loginuserEmail);
    const [selectedDate, setSelectedDate] = useState(null);
    const [statsChart, setStatsChart] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [dataFetchedError, setFetchedError] = useState(true);
    const [startDate, setStartDate] = useState(new Date());

    // Function to format the selected date in DD-MM-YYYY format
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Handle date selection
    const handleDateChange = (date) => {
        const formattedDate = formatDate(date);
        setSelectedDate(formattedDate);
        setStartDate(date);
        fetchDataByDate(formattedDate);  // Trigger data fetching after date selection
    };

    const fetchDataByDate = (date) => {
         // Replace with the logged-in user's email
        const timeZone = moment.tz.guess(); // Automatically get the user's local time zone
    
        // Construct the date string in the format 'YYYY-MM-DD' to match the backend format
        const formattedDate = moment(date, 'DD-MM-YYYY').format('DD-MM-YYYY');
    
        // Make the API request to the new endpoint with the date and timeZone as query parameters
        axios
            .get(`https://wordle-server-nta6.onrender.com/wordle/${userEmail}/date`, {
                params: {
                    date: formattedDate,
                    timeZone: timeZone,
                },
            })
            .then((response) => {
                setStatsChart(response.data);
                setDataFetched(true);
                setFetchedError(false);
            })
            .catch((error) => {
                // console.error('Error fetching data:', error);
                setStatsChart([]); // Set statsChart to an empty array if no data is found or an error occurs
                setDataFetched(true);
                setFetchedError(true);
            });
    };
    
    
    // Function to slice the string into rows of a specified length
    function splitIntoRows(inputString, rowLength) {
        const rows = [];
        const charArray = Array.from(inputString); // Convert string to array of characters
        for (let i = 0; i < charArray.length; i += rowLength) {
            rows.push(charArray.slice(i, i + rowLength).join(''));
        }
        return rows;
    }
    // Format createdAt to DD-MM-YYYY before displaying
    const formatCreatedAt = (createdAt) => {
        const date = new Date(createdAt);
        return formatDate(date);  // Reuse the formatDate function to format createdAt
    };
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
                    dateFormat="DD-MM-YYYY"
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
                            <li key={item._id}>
                                <div className='text-center'>
                                    <p className='m-0'><strong>{item.username}</strong></p>
                                    <p className='m-1'>{cleanedScore}</p>
                                    <p className='my-1'>{formatCreatedAt(item.createdAt)}</p>
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
