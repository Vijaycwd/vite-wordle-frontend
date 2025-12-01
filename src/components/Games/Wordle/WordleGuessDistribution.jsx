import { useState, useEffect } from 'react';
import Axios from 'axios';

function WordleGuessDistribution() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const loginuserEmail = USER_AUTH_DATA?.email;
  const [wordleGuessData, setwordleGuessData] = useState([]);
  const [highlightData, sethandlehighlightData] = useState([]);

  useEffect(() => {
    const interval = setInterval(getGuessValue, 3000); // Fetch every 2 seconds
      return () => clearInterval(interval); // Cleanup on unmount
      }, []);
  
  function getGuessValue() {
    Axios.get(`${baseURL}/games/wordle/get-guessdistribution.php?useremail=${loginuserEmail}`)
      .then((response) => {
        
        const guessdistribution = response.data.guessdistribution;
        setwordleGuessData(guessdistribution);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');

        const formattedToday = `${year}-${month}-${day}`;
        
        const handleHighlights = guessdistribution
        .filter((item) => {
          const formattedDate = item.updatedDate.split(' ')[0];
          
          return formattedDate === formattedToday; // Compare with today's formatted date
        })
        .map((item) => item.handleHighlight)
        .flat();
  
        
        sethandlehighlightData(handleHighlights);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
  
  return (
    <div>
      {wordleGuessData.map((data, index) => {
        const totalSum = data.guessDistribution.reduce((sum, guess) => sum + parseFloat(guess), 0);
        return (
          <div key={index} className="guess-distribution my-4">
            <h2 className="text-uppercase">Guess Distribution</h2>
            {data.guessDistribution.map((guess, i) => {
              const guessValue = parseFloat(guess);
              const percentage = totalSum > 0 ? Math.round((guessValue / totalSum) * 100) : 0;
              const isHighlighted = highlightData.includes(i); // Check if index is highlighted
              
              return (
                <div key={i} className="guess-item my-2 d-flex align-items-center">
                  <span>{i + 1}</span>
                  <div
                    className="text-end px-2 guess-item-value"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isHighlighted ? '#58A351' : '#787C7E',
                      color: '#ffffff',
                    }}
                  >
                    {guess}
                  </div>
                  <span>({percentage}%)</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
  
}

export default WordleGuessDistribution;
