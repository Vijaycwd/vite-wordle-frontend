import { useState, useEffect } from 'react';
import Axios from 'axios';

function phrazleStatistics() {

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [phrazleStatsData, setphrazleStatsData] = useState();
    const [currentStreak, setcurrentStreak] = useState();
    const [maxStreak, setmaxStreak] = useState();

    // useEffect(() => {
    //     getStatsValue();
    // }, [wordleStatsData]); // Update stats when updateStatsStatistics changes

    useEffect(() => {
        if (loginuserEmail) {
            getStatsValue();
        }
      }, [loginuserEmail])

    function getStatsValue() {
       
        Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/phrazle/get-statistics.php?useremail=${loginuserEmail}`)
            .then((response) => {
                const statistics = response.data.statistics;
                statistics.forEach((item) => {
                    setphrazleStatsData(item);
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
            {phrazleStatsData ? (
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

export default phrazleStatistics;
