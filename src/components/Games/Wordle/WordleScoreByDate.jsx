import React, { useState, useRef, forwardRef } from 'react';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';

function WordleScoreByDate() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [userEmail] = useState(loginuserEmail);
    const [statsChart, setStatsChart] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState("");
    // Function to format the selected date in DD-MM-YYYY format
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(timeZone);
    // Handle date selection
    const handleDateChange = (date) => {
        // Use moment-timezone to format the selected date
        const formattedDate = moment(date).tz(timeZone).format("DD-MM-YYYY");
        console.log("Original createdAt:", stat.createdAt);
        console.log("Formatted createdAtLocal:", moment.tz(stat.createdAt, timeZone).format('DD-MM-YYYY HH:mm:ss'));
        console.log(formattedDate);
        setSelectedDate(formattedDate);
        setStartDate(date);
        // Trigger data fetching after date selection with the formatted date
        fetchData(formattedDate);
    };
    
    
    // Fetch data based on the selected date
    const fetchData = (date) => {
        axios.get(`https://wordle-server-nta6.onrender.com/wordle/${userEmail}/?timeZone=${timeZone}`)
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
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                />
            </div>
            <ul className='score-by-date p-2'>
                {dataFetched && (statsChart.length > 0 ? (
                    statsChart.map(item => {
                        const cleanedScore = item.wordlescore.replace(/[🟩🟨⬜]/g, "");
                        const lettersAndNumbersRemoved = item.wordlescore.replace(/[a-zA-Z0-9,/\\]/g, "");
                        const removespace = lettersAndNumbersRemoved.replace(/\s+/g, '');
                        const wordleScores = splitIntoRows(removespace, 5);
                        console.log(item);
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
                    <Alert key='danger' variant='danger' className='p-1'>
                        No data found for the selected date.
                    </Alert>
                ))}
            </ul>
        </>
    );
}

export default WordleScoreByDate;