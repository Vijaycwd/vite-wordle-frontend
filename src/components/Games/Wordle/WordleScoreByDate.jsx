import React, { useState } from 'react';
import axios from 'axios';
import { Form, InputGroup, Button, Alert} from 'react-bootstrap';


function WordleScoreByDate() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    
    const [userEmail] = useState(loginuserEmail);
    const [selectedDate, setSelectedDate] = useState(null);
    const [statsChart, setStatsChart] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value); // Assuming the date picker returns a date in a suitable format
    };

    const fetchData = () => {
        axios.get('https://wordle-server-nta6.onrender.com/wordle')
            .then((response) => {
                const scoreData = response.data
                    .filter(item => item.useremail === userEmail)
                    .filter(item => new Date(item.createdAt).toDateString() === new Date(selectedDate).toDateString()); // Filter by date
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

    return (
        <>
            <InputGroup className="mb-3">
            <Form.Control
                type="date"
                id="inputPassword5"
                aria-describedby="passwordHelpBlock"
                onChange={handleDateChange}
            />
            <Button variant="primary" className='wordle-btn' onClick={fetchData} >Go To Date</Button>
            </InputGroup> 
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
