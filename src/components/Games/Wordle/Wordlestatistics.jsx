import React, { useState, useEffect } from 'react';
import Axios from 'axios';

import { USER_AUTH_DATA } from '../../../constant/constants';

function Wordlestatistics() {
    
    const loginuserEmail = USER_AUTH_DATA.email;
    const [userEmail, setUserEmail] = useState(loginuserEmail);
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [wordleStatsData, setwordleStatsData] = useState();
    const [currentStreak, setcurrentStreak] = useState();
    const [maxStreak, setmaxStreak] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStatsValue();
    }, []);

    function getStatsValue() {
        Axios.get(`https://wordle-server-gf3r.onrender.com/wordle-game-stats/${userEmail}`)
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