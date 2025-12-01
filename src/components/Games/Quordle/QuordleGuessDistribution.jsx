import { useState, useEffect } from 'react';
import Axios from 'axios';

function QuordleGuessDistribution() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const loginuserEmail = USER_AUTH_DATA?.email;
  const [QuordleGuessData, setQuordleGuessData] = useState([]);
  const [highlightData, sethandlehighlightData] = useState([]);

  useEffect(() => {
    if (loginuserEmail) {
        getGuessValue();
    }
  }, []);

  function getGuessValue() {
    Axios.get(`${baseURL}/games/Quordle/get-guessdistribution.php?useremail=${loginuserEmail}`)
    .then((response) => {
     
      const guessdistribution = response.data.guessdistribution;
      setQuordleGuessData(guessdistribution);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const day = String(today.getDate()).padStart(2, '0');

      const formattedToday = `${year}-${month}-${day}`;
     

      const handleHighlights = guessdistribution
      .filter((item) => {
        const formattedDate = item.updatedDate.split('T')[0];
        
        return formattedDate === formattedToday; // Compare with today's formatted date
      })
      .map((item) => item.handleHighlight)
      .flat();

      
      sethandlehighlightData(handleHighlights);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  };

  return (
    <div>
      {QuordleGuessData.map((data, index) => {
        const totalSum = data.guessDistribution.reduce((sum, guess) => sum + parseFloat(guess), 0);
        return (
          <div key={index} className='guess-distribution my-4'>
            <h2 className='text-uppercase'>Mistake Distribution</h2>
            {data.guessDistribution.map((guess, i) => {
              const guessValue = parseFloat(guess);
              const percentage = totalSum > 0 ? Math.round((guessValue / totalSum) * 100) : 0;
              const isHighlighted = highlightData && highlightData.includes(i);
              return (
                <div key={i} className='guess-item my-2 d-flex align-items-center'>
                  <span>{i}</span>
                  <div
                    className="text-end px-2 guess-item-value"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isHighlighted ? '#B3A7FF' : '#787C7E',
                      color: '#ffffff',
                    }}
                  >
                    <div className=''>
                      {guess}
                    </div>
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

export default QuordleGuessDistribution;
