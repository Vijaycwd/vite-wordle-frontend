import React, { useState, useEffect } from 'react';
import Axios from 'axios';
function Wordlestatistics() {
    
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [userEmail, setUserEmail] = useState(loginuserEmail);
    const [totalGame, setTotalGame] = useState(null);
    const [totalWin, setTotalWin] = useState(null);
    const [wordleStatsData, setwordleStatsData] = useState(null);
    const [currentStreak, setcurrentStreak] = useState(null);
    const [maxStreak, setmaxStreak] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStatsValue();
    }, []);

    function getStatsValue() {
        Axios.get(`https://wordle-server-nta6.onrender.com/wordle-game-stats/${userEmail}`)
            .then((response) => {
                console.log(response.data);
                setwordleStatsData(response.data);
                setTotalGame(response.data.totalGamesPlayed);
                setTotalWin(response.data.totalWinGames);
                setcurrentStreak(response.data.currentStreak);
                setmaxStreak(response.data.maxStreak);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
                setLoading(false);
            });
    }
    // console.log(wordleStatsData);
    const WinningPercent= Math.round((totalWin / totalGame) * 100);
    const isValidNumber = !isNaN(WinningPercent);





  return (
    <div className="statistics">
        <h2 className='text-uppercase'>Statistics</h2>
        {loading ? (
            <div>Loading...</div>
        ) : wordleStatsData ? (
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
  )
}

export default Wordlestatistics