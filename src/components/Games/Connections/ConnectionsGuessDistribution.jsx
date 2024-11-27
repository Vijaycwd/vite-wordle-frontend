import { useState, useEffect } from 'react';
import Axios from 'axios';

function ConnectionsGuessDistribution() {

  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const loginuserEmail = USER_AUTH_DATA?.email;
  const [connectionsGuessData, setconnectionsGuessData] = useState([]);
  const [highlightData, sethandlehighlightData] = useState([]);

  useEffect(() => {
    if (loginuserEmail) {
        getGuessValue();
    }
  }, [connectionsGuessData,loginuserEmail]);

  function getGuessValue() {
    Axios.get(`https://coralwebdesigns.com/college/wordgamle/games/connections/get-guessdistribution.php?useremail=${loginuserEmail}`)
        .then((response) => {
        // console.log("Response Data:", response.data.guessdistribution);
        const guessdistribution = response.data.guessdistribution;
        setconnectionsGuessData(guessdistribution);
        const today = new Date().toISOString().split('T')[0]; // Current date
        // console.log("Today Date:", today);
  
        const handleHighlights = guessdistribution
          .filter((item) => {
            const formattedDate = item.updatedDate.split('T')[0];
            // console.log("Item Date:", formattedDate, "Matches Today:", formattedDate === today);
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
      {connectionsGuessData.map((data, index) => {
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

export default ConnectionsGuessDistribution;
