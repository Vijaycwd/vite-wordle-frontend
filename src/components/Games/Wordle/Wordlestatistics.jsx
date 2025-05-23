import { useState, useEffect } from 'react';
import Axios from 'axios';
import { ProgressBar } from "react-bootstrap";


function Wordlestatistics(updateStatistics) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [wordleStatsData, setwordleStatsData] = useState();
    const [currentStreak, setcurrentStreak] = useState();
    const [maxStreak, setmaxStreak] = useState();
    const [guessDistribution, setguessDistribution] = useState();

    // useEffect(() => {
    //     getStatsValue();
    // }, [wordleStatsData]); // Update stats when updateStatsStatistics changes

    useEffect(() => {
        if (loginuserEmail) {
            getStatsValue();
        }
      }, [wordleStatsData, loginuserEmail])

    function getStatsValue() {
       
        Axios.get(`${baseURL}/games/wordle/get-statistics.php?useremail=${loginuserEmail}`)
            .then((response) => {
                

                if (typeof updateStatistics === 'function') {
                    updateStatistics();
                }
                const statistics = response.data.statistics;
                // console.log(statistics);
                setwordleStatsData(statistics);
                setTotalGame(statistics.totalGamesPlayed);
                setTotalWin(statistics.winPercentage);
                setcurrentStreak(statistics.currentStreak);
                setmaxStreak(statistics.maxStreak);
                setguessDistribution(statistics.guessDistribution);      
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
                
            });
    }
    return (
        <div className="statistics">
            <h2 className='text-uppercase'>Statistics</h2>
    
            {wordleStatsData ? (
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
                            <div className='bottom-text'>Current Streak</div>
                        </li>
                        <li>
                            <div className='value'>{maxStreak}</div>
                            <div className='bottom-text'>Max Streak</div>
                        </li>
                    </ul>
    
                    <div className="guess-distribution my-4">
                        <h2 className="text-uppercase">Guess Distribution</h2>
                        {Object.entries(guessDistribution).map(([guess, count]) => {
                            const total = Object.values(guessDistribution).reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? (count / total) * 100 : 0;

                            return (
                                <div key={guess} className="mb-2">
                                <div className="d-flex align-items-center">
                                  {/* Guess Number */}
                                  <div className="text-end" style={{ width: "20%", textAlign: "center", fontWeight: "bold" }}>
                                    {guess}
                                  </div>
                              
                                  {/* Progress Bar */}
                                  <div style={{ width: "75%", margin: "0 10px", position: "relative" }}>
                                    <ProgressBar
                                        className="wordle-progress-bar"
                                        now={percent}
                                        label=""
                                    />
                                    <span className="progress-label">{count > 0 ? count : ''}</span>
                                    </div>
                              
                                  {/* Percentage */}
                                  <div style={{ width: "5%", textAlign: "right", fontSize: "0.9rem" }}>
                                    {`${percent.toFixed(0)}%`}
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

export default Wordlestatistics;
