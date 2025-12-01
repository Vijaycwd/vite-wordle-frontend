import { useState, useEffect } from 'react';
import Axios from 'axios';
import { ProgressBar } from "react-bootstrap";

function QuordleStatistics({ statschart }) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [QuordleStatsData, setQuordleStatsData] = useState();
    const [currentStreak, setcurrentStreak] = useState();
    const [maxStreak, setmaxStreak] = useState();
    const [guessDistribution, setguessDistribution] = useState();
    const [perfectPuzzles, setperfectPuzzles] = useState();
    const [purpleFirst, setpurpleFirst] = useState();

    useEffect(() => {
        if (loginuserEmail) {
            getStatsValue();
        }
      }, [statschart])

    function getStatsValue() {
        Axios.get(`${baseURL}/games/quordle/get-statistics.php?useremail=${loginuserEmail}`)
            .then((response) => {
                if (typeof updateStatistics === 'function') {
                    updateStatistics();
                }
                const statistics = response.data.statistics;
               
                setQuordleStatsData(statistics);
                setTotalGame(statistics.totalGamesPlayed);
                setTotalWin(statistics.winPercentage);
                setcurrentStreak(statistics.currentStreak);
                setmaxStreak(statistics.maxStreak);
                setguessDistribution(statistics.guessDistribution);    
                setperfectPuzzles(statistics.perfectPuzzles);
                setpurpleFirst(statistics.purpleFirst);   
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
        
                {QuordleStatsData ? (
                    <>
                        <ul>
                            <li>
                                <div className='value'>{totalGame}</div>
                                <div className='bottom-text'>Played</div>
                            </li>
                            <li>
                                <div className='value'>{totalWin}</div>
                                <div className='bottom-text'>Win %</div>
                            </li>
                            <li>
                                <div className='value'>{currentStreak}</div>
                                <div className='bottom-text'>Win Streak</div>
                            </li>
                            <li>
                                <div className='value'>{maxStreak}</div>
                                <div className='bottom-text'>Max Streak</div>
                            </li>
                        </ul>
                        <div className="guess-distribution my-4">
                            <h2 className="text-uppercase">Guess Distribution</h2>
                            {Object.entries(guessDistribution).map(([guess, data]) => {
                                // const total = Object.values(guessDistribution).reduce((a, b) => a + b, 0);
                                // const percent = total > 0 ? (data.count / total) * 100 : 0;
                                return (
                                    <div key={guess} className="mb-2">
                                    <div className="d-flex align-items-center">
                                      {/* Guess Number */}
                                      <div className='text-end' style={{ width: "15%", textAlign: "center", fontWeight: "bold" }}>
                                        {guess}
                                      </div>
                                  
                                      {/* Progress Bar */}
                                      <div style={{ width: "75%", margin: "0 10px", position: "relative" }}>
                                        <ProgressBar
                                            className="quordle-progress-bar"
                                            now={data.percent}
                                            label=""
                                        />
                                        <span className="progress-label">{data.count > 0 ? data.count : ''}</span>
                                        </div>
                                      {/* Percentage */}
                                      <div style={{ width: "5%", textAlign: "right", fontSize: "0.9rem" }}>
                                        {`${data.percent.toFixed(0)}%`}
                                      </div>
                                    </div>
                                  </div>
                                  
                                );
                            })}
                            </div>
    
                    </>
                ) : (
                    <div>Data Not Found</div>
                )}
            </div>
        );
}

export default QuordleStatistics;
