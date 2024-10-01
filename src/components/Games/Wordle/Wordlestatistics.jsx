import React, { useState, useEffect } from 'react';
import Axios from 'axios';

function Wordlestatistics() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [userEmail, setUserEmail] = useState(loginuserEmail);
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [wordleStatsData, setwordleStatsData] = useState();
    const [currentStreak, setcurrentStreak] = useState();
    const [maxStreak, setmaxStreak] = useState();
    
    const [statChart, setStatChart] = useState(null);

    // useEffect(() => {
    //     getStatsValue();
    // }, [wordleStatsData]); // Update stats when updateStatsStatistics changes

    useEffect(() => {
        if (loginuserEmail) {
            getStatsValue();
        }
      }, [loginuserEmail, wordleStatsData])

    function getStatsValue() {
       
        Axios.get(`https://wordle-server-nta6.onrender.com/wordle-game-stats/${userEmail}`)
            .then((response) => {
                response.data.forEach((item) => {
                    setwordleStatsData(item);
                    setTotalGame(item.totalGamesPlayed);
                    setTotalWin(item.totalWinGames);
                    setcurrentStreak(item.currentStreak);
                    setmaxStreak(item.maxStreak);
                    
                });      
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
                
            });
    }

    const WinningPercent = Math.round((totalWin / totalGame) * 100);
    const isValidNumber = !isNaN(WinningPercent);

    return (
        <div className="statistics">
            <h2 className='text-uppercase'>Statistics</h2>
            {wordleStatsData ? (
                <ul>
                    <li>
                        <div className='value'>
                            {totalGame}
                        </div>
                        <div className='bottom-text'>
                            Total Played
                        </div>
                    </li>
                    <li>
                        <div className='value'>
                            {isValidNumber ? WinningPercent : 0}     
                        </div>
                        <div className='bottom-text'>
                            Win %
                        </div>
                    </li>
                    <li>
                        <div className='value'>
                            {currentStreak}
                        </div>
                        <div className='bottom-text'>
                            Current Streak
                        </div>
                    </li>
                    <li>
                        <div className='value'>
                            {maxStreak}
                        </div>
                        <div className='bottom-text'>
                            Max Streak
                        </div>
                    </li>
                </ul>
            ) : (
                <div>Data Not Found</div>
            )}
        </div>
    );
}

export default Wordlestatistics;
