import { useState, useEffect } from 'react';
import Axios from 'axios';

function PhrazleGuessDistribution() {

  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const loginuserEmail = USER_AUTH_DATA?.email;
  const [phrazleGuessData, setphrazleGuessData] = useState([]);
  const [highlightData, sethandlehighlightData] = useState([]);

  useEffect(() => {
    if (loginuserEmail) {
        getGuessValue();
    }
  }, [phrazleGuessData,loginuserEmail]);

  function getGuessValue() {
    Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/phrazle/get-guessdistribution.php?useremail=${loginuserEmail}`)
    .then((response) => {
      console.log("Response Data:", response.data.guessdistribution);
      const guessdistribution = response.data.guessdistribution;
      setphrazleGuessData(guessdistribution);
      const today = new Date().toISOString().split('T')[0]; // Current date
      console.log("Today Date:", today);

      const handleHighlights = guessdistribution
        .filter((item) => {
          console.log(item);
          const formattedDate = item.updatedDate.split('T')[0];
          console.log("Item Date:", formattedDate, "Matches Today:", formattedDate === today);
          return formattedDate === today; // Compare with today's date
        })
        .map((item) => item.handleHighlight)
        .flat();

      // console.log("Highlight Data:", handleHighlights); // Log highlight data
      sethandlehighlightData(handleHighlights);
    })
    .catch((error) => {
      // console.error("Error fetching data:", error);
    });
  };

  return (
    <div>
      {phrazleGuessData.map((data, index) => {
        const totalSum = data.guessDistribution.reduce((sum, guess) => sum + parseFloat(guess), 0);
        return (
          <div key={index} className='guess-distribution my-4'>
            <h2 className='text-uppercase'>Guess Distribution</h2>
            {data.guessDistribution.map((guess, i) => {
              const guessValue = parseFloat(guess);
              const percentage = totalSum > 0 ? Math.round((guessValue / totalSum) * 100) : 0;
              const isHighlighted = highlightData && highlightData.includes(i);
              return (
                <div key={i} className='guess-item my-2 d-flex align-items-center'>
                  <span>{i + 1}</span>
                  <div
                    className="text-end px-2 guess-item-value"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isHighlighted ? '#218838' : '#787C7E',
                      color: '#ffffff',
                    }}
                  >
                    <div className='phrazle-row-score'>
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

export default PhrazleGuessDistribution;