import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function GroupStats() {
  const navigate = useNavigate();
  const { id, groupName } = useParams();
  const [selectedGames, setSelectedGames] = useState([]);
  const [group, setGroup] = useState(null);
  // Get user ID from localStorage
  const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
  const userId = userAuthData.id;
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
        try {
            const res = await axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-groups.php?id=${id}`);
            if (res.data.status === "success" && res.data.groups.length > 0) {
                const fetchedGroup = res.data.groups[0];
                setGroup(fetchedGroup);
            } else {
                setGroup(null);
                toast.error("Group not found.");
            }
        } catch (err) {
            setGroup(null);
            toast.error("Failed to load group details.");
        }
    };

    fetchGroupDetails();
  }, [id, userId]);

  useEffect(() => {
    const fetchSelectedGames = async () => {
        try {
          const res = await axios.get("https://coralwebdesigns.com/college/wordgamle/groups/get-selected-games.php", {
              params: { user_id: userId, group_id: id }
          });
            let userGames = res.data.selected_games;

            if (typeof userGames === "string") {
                userGames = userGames.split(",").map(game => game.trim()); // Convert string to array
            }

            if (Array.isArray(userGames)) {
                setSelectedGames(userGames);
            } else {
                console.error("Invalid data format for selected games:", userGames);
                setSelectedGames([]); // Ensure state remains an array
            }
        } catch (error) {
            console.error("Error fetching selected games:", error);
            setSelectedGames([]);
        }
    };

    if (userId) {
        fetchSelectedGames();
    }
}, [userId]);


  // List of available games
  const games = [
    { key: 'wordle', label: 'Wordle' },
    { key: 'connections', label: 'Connections' },
    { key: 'phrazle', label: 'Phrazle' }
  ];
  
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} className="text-center mt-4">
          <h2 className='text-capitalize pb-2'>{group?.name || ""}</h2>
          <h3 className='pb-4'>Group Leaderboards</h3>
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
