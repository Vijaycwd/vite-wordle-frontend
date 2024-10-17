import React, { useState, useEffect } from 'react';
import Axios from 'axios';

function WordleGuessDistribution() {

  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const loginuserEmail = USER_AUTH_DATA.email;
  const [wordleGuessData, setwordleGuessData] = useState([]);

  useEffect(() => {
    if (loginuserEmail) {
        getGuessValue();
    }
  }, [loginuserEmail, wordleGuessData]);

  function getGuessValue() {
    Axios.get(`https://wordle-server-nta6.onrender.com/wordle-game-stats/${loginuserEmail}`)
        .then((response) => {
            const guessData = response.data.map(item => ({
                guessDistribution: item.guessDistribution
            }));
            setwordleGuessData(guessData);     
        })
        .catch((error) => {
            console.error("Error fetching data: ", error);
        });
  }
console.log(wordleGuessData);
  return (
    <>
    <div>
      {wordleGuessData.map((data, index) => {
        // Calculate the total sum of guesses
        const totalSum = data.guessDistribution.reduce((sum, guess) => sum + parseFloat(guess), 0);
        return (
          <div key={index} className='guess-distribution my-4'>
            <h2 className='text-uppercase'>Guess Distribution</h2>
            {data.guessDistribution.map((guess, i) => {
              // Calculate the percentage for each guess
              const guessValue = parseFloat(guess);
              const percentage = totalSum > 0 ? Math.round((guessValue / totalSum) * 100) : 0;

              return (
                  <div key={i} className='guess-item my-2 d-flex align-items-center'>
                    <span>
                      {i + 1}
                    </span>
                    <div className="text-end px-2 guess-item-value" style={{width:`${percentage}%`, backgroundColor: '#787c7e', color: '#ffffff'}}>
                    {guess}
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
    </>
  );
}

export default WordleGuessDistribution;
