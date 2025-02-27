import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

function GroupStats() {
  const navigate = useNavigate();
  const { id, groupName } = useParams();
  const formattedGroupName = decodeURIComponent(groupName).replace(/-/g, ' '); // Fix URL formatting
  const [selectedGames, setSelectedGames] = useState([]);

  // Get user ID from localStorage
  const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
  const userId = userAuthData.id;

  useEffect(() => {
    axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-selected-games.php?user_id=${userId}`)
      .then(response => {
        let userGames = response.data.selected_games;

        // Convert comma-separated string to an array
        if (typeof userGames === 'string') {
          userGames = userGames.split(',').map(game => game.trim());
        }

        console.log("Selected Games:", userGames); // Debugging
        setSelectedGames(userGames || []);
      })
      .catch(error => console.error("Error fetching selected games:", error));
  }, [userId]);

  // List of available games
  const games = [
    { key: 'wordle', label: 'Wordle' },
    { key: 'connections', label: 'Connections' },
    { key: 'phrazle', label: 'Phrazle' }
  ];
console.log(games);
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} className="text-center mt-4">
          <h2 className='text-capitalize pb-2'>{formattedGroupName}</h2>
          <h3 className='pb-4'>Group Stats</h3>
          <Row>
          {selectedGames.map((game, index) => (
            <Col className="text-center mt-4">
            <Button 
              key={index} 
              className="btn-lg btn-block w-100" 
              onClick={() => navigate(`/group/${id}/${groupName}/stats/${game.toLowerCase()}`)}
            >
              {game}
            </Button>
            </Col>
          ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default GroupStats;
