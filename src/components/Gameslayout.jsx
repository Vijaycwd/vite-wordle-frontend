import React, { useState, useEffect  } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import Wordlegamesection from './Games/Wordle/Wordlegamesection';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Games/Wordle/Modals/LoginModal';
import WordleModal from './Games/Wordle/Modals/WordleScoreModal';

function GamesLayout() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const { username, email } = USER_AUTH_DATA;
  const loginUsername = username;
  const loginUserEmail = email;
  const [showForm, setShowForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [score, setScore] = useState('');
  const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0, 0]);
  const [gameIsWin, setGameIsWin] = useState(false);
  const [userData, setUserData] = useState('');
  const navigate = useNavigate();
  const userEmail = USER_AUTH_DATA.email;
  const userId = USER_AUTH_DATA?.id;
  const [lastGroup, setLastGroup] = useState(null);

  useEffect(() => {
    if (userEmail) {
      Axios.get(`${baseURL}/user/get-user.php`, {
        params: { useremail: userEmail },
      })
      .then(response => {
        setUserData(response.data.user);  // Assumes response has user details in `data`
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
    }
  }, [userEmail]);

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Check if time is between 11:59:00 PM and 11:59:59 PM
    if (hours === 23  && minutes > 50) {
      const today = now.toISOString().split('T')[0];
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      Axios.get(`${baseURL}/games/wordle/get-score.php?useremail=${loginUserEmail}&today=${today}`)
        .then(res => {
         
          const hasPlayedToday = res.data.wordlescore;
          
          if (!hasPlayedToday) {
            
            const missedGameObj = {
              username: loginUsername,
              useremail: loginUserEmail,
              wordlescore: 'X/6',
              guessDistribution: guessDistribution,
              isWin: false,
              gamleScore: 7,
              createdAt: now.toISOString(),
              currentUserTime: now.toISOString(),
              timeZone
            };
  
            Axios.post(`${baseURL}/games/wordle/create-score.php`, missedGameObj)
              .then(() => {
                Axios.get(`${baseURL}/games/wordle/create-statistics.php/${loginUserEmail}`)
                  .then(statsRes => {
                    const TotalGameObject = {
                      username: loginUsername,
                      useremail: loginUserEmail,
                      totalWinGames: statsRes.data.totalWinGames || 0,
                      lastgameisWin: false,
                      currentStreak: 0,
                      guessDistribution: guessDistribution,
                      updatedDate: now.toISOString()
                    };
  
                    updateTotalGamesPlayed(TotalGameObject);
                  });
              });
          }
        });
    }
  }, [userEmail]);
  
  

  const handleFormClose = () => {
      setShowForm(false);
      setScore('');
  };

  const handleLoginPromptClose = () => {
      setShowLoginPrompt(false);
  };

  const handleShow = async (event) => {
    event.preventDefault();
      if (!loginUsername || !loginUserEmail) {
          setShowLoginPrompt(true);
          return;
      }
      setShowForm(true);
  };

  //get latest group intraction
  useEffect(() => {
    const fetchLastGroup = async () => {
      try {
        const response = await Axios.get(
          `${baseURL}/games/wordle/get-last-group.php`,
          { params: { user_id: userId } }
        );
        setLastGroup(response.data);
      } catch (error) {
        console.error("Error fetching last group:", error);
      }
    };
  
    if (userId) {
      fetchLastGroup();
    }
  }, [userId]);
  
  const onSubmit = async (event) => {
    event.preventDefault();
    setShowForm(false);
    if (typeof updateStatsChart === 'function') {
        updateStatsChart();
    }
    setShowForm(false);
    
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const localDate = new Date();

    // Get time zone offset in minutes
    const offsetMinutes = localDate.getTimezoneOffset();  // Offset in minutes (positive for behind UTC, negative for ahead)

    // Now adjust the time by adding the time zone offset (this does not affect UTC, it gives the correct local time)
    const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); // Adjust time by the offset in milliseconds

    // Get the adjusted time in 24-hour format, e.g., "2024-12-02T15:10:29.476"
    const adjustedCreatedAt = adjustedDate.toISOString().slice(0, -1);  // "2024-12-02T15:10:29.476" (24-hour format)

    



    const wordleScore = score.replace(/[🟩🟨⬜⬛]/g, "");
    const match = wordleScore.match(/(\d+|X)\/(\d+)/);
    
    if (match) {
        let guessesUsed = match[1] === "X" ? 7 : parseInt(match[1], 10); // Assign 7 for failed attempts ("X")
        const totalGuesses = parseInt(match[2], 10);
        const isWin = match[1] !== "X" && guessesUsed <= totalGuesses;

        setGameIsWin(isWin);
        const updatedGuessDistribution = [...guessDistribution];
        if (isWin && guessesUsed <= 6) {
            updatedGuessDistribution[guessesUsed - 1] += 1;
        }
        setGuessDistribution(updatedGuessDistribution);

        const wordleObject = {
            username: loginUsername,
            useremail: loginUserEmail,
            wordlescore: score,
            guessDistribution: updatedGuessDistribution,
            isWin,
            gamleScore: guessesUsed,
            createdAt: adjustedCreatedAt,
            currentUserTime: adjustedCreatedAt,
            timeZone,
            groupId:lastGroup?.group_id,
            gameName:"wordle",
            userId
        };
       
        try {
            const res = await Axios.post(`${baseURL}/games/wordle/create-score.php`, wordleObject);
           
            if (res.data.status === 'success') {
                if (typeof updateStatsChart === 'function') {
                    updateStatsChart();
                }
                const currentStats = await Axios.get(`${baseURL}/games/wordle/create-statistics.php/${loginUserEmail}`);
                const currentStreak = currentStats.data.currentStreak || 0;
                const streak = isWin ? currentStreak + 1 : 0;
                const TotalGameObject = {
                    username: loginUsername,
                    useremail: loginUserEmail,
                    totalWinGames: isWin ? (currentStats.data.totalWinGames || 0) + 1 : currentStats.data.totalWinGames || 0,
                    lastgameisWin: isWin,
                    currentStreak: streak,
                    guessDistribution: updatedGuessDistribution,
                    updatedDate: adjustedCreatedAt
                };
                
                await updateTotalGamesPlayed(TotalGameObject);
                setScore('');
                const latest_group_id = lastGroup?.group_id;
                if(latest_group_id){
                navigate(`/group/${latest_group_id}/stats/wordle`);
                }
                else{
                navigate("/wordlestats");
                }
            }
            else{
                toast.error(res.data.message );
            }
        } catch (err) {
            toast.error(err.res?.data?.message || 'An unexpected error occurred.');
        }
    }
};

const updateTotalGamesPlayed = async (TotalGameObject) => {
    try {
        await Axios.post(`${baseURL}/games/wordle/update-statistics.php`, TotalGameObject);
    } catch (err) {
        toast.error('Failed to update total games played');
    }
};

  return (
    <>
    <Container>
      <Row className="justify-content-center align-items-center">
        <Col className="text-center py-3">
          {userData.username ? <h2>{"Welcome " + userData.username + "!"}</h2> : <h2>{"Welcome Guest!"}</h2>}
        </Col>
      </Row>
      <Row className="justify-content-center align-items-center">
        <Wordlegamesection />
      </Row>
      <Row className="justify-content-center align-items-center">
        <Col md={6} className="py-5">
          <div>
            <p>Click the “Play” button to go to the Wordle website and play. Then:</p>
            <ol>
              <li><strong>PLAY:</strong> Play Wordle</li>
              <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Wordle result</li>
              <li><strong>PASTE:</strong> Navigate back to WordGAMLE.com to paste your Wordle result</li>
            </ol>
            <Row className="d-flex justify-content-between align-items-center">
              <Col md={8} xs={8}>
                <p className="bottom-message">*For anyone who has already played and has the result copied, click the “Enter Result” button to enter today’s game result.</p>
              </Col>
              <Col md={4} xs={4}>
                <Button className="wordle-btn bottom-btn" onClick={handleShow}>
                  Enter Result
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Login Prompt Modal */}
      <LoginModal
        showLoginPrompt={showLoginPrompt}
        handleLoginPromptClose={handleLoginPromptClose}
      />

      {/* Score Submission Modal */}
      <WordleModal
        showForm={showForm}
        handleFormClose={handleFormClose}
        onSubmit={onSubmit}
        score={score}
        setScore={setScore}
        loginUsername={loginUsername}
      />
    </Container>
    </>
  );
}

export default GamesLayout;
