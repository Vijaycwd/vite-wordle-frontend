import React, { useState, useRef, forwardRef } from 'react';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function WordleScoreByDate() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;

    const [userEmail] = useState(loginuserEmail);
    const [selectedDate, setSelectedDate] = useState(null);
    const [statsChart, setStatsChart] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
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
        fetchData(formattedDate);  // Trigger data fetching after date selection
    };

    // Fetch data based on the selected date
    const fetchData = (date) => {
        axios.get('https://wordle-server-nta6.onrender.com/wordle')
            .then((response) => {
                const scoreData = response.data
                    .filter(item => item.useremail === userEmail)
                    .filter(item => new Date(item.createdAt).toDateString() === new Date(date.split('-').reverse().join('-')).toDateString()); // Filter by selected date
                setStatsChart(scoreData);
                setDataFetched(true);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
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

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <button className="example-custom-input" onClick={onClick} ref={ref}>
            Go To Date
        </button>
    ));

    return (
        <>
            <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                customInput={<ExampleCustomInput />}
                dateFormat="dd-MM-yyyy"
            />
            <ul className='score-by-date p-0'>
                {dataFetched && (statsChart.length > 0 ? (
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
                                    {wordleScores.map((row, rowIndex) => (
                                        <p className='m-1' key={rowIndex}>{row}</p>
                                    ))}
                                </div>
                            </li>
                        );
                    })
                ) : (
                    <Alert key='danger' variant='danger' className='p-1'>
                        No data found for the selected date.
                    </Alert>
                ))}
            </ul>
        </>
    );
}

export default WordleScoreByDate;
