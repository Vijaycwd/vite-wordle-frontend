import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import GroupLeaderboardScores from './GroupLeaderboard/GroupLeaderboardScores';
import GroupScoreByDate from './GroupLeaderboard/GroupScoreByDate';

function GroupStatsPage() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const { id, groupName, game } = useParams(); // Extract groupName and game from URL
  const [group, setGroup] = useState(null);
  const [latestJoinDate, setLatestJoinDate] = useState(null);
  // Get user ID from localStorage
  const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
  const userId = userAuthData.id;
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
        try {
            const res = await axios.get(`${baseURL}/groups/get-groups.php?id=${id}`);
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

  return (
    <Container>
      <Row className='pb-5'>
        <Col className="text-center mt-4">
          <h2 className='text-capitalize py-3'>{group?.name || ""} - {game}</h2>
          {/* <h3 className='text-capitalize py-3'>{game} Leaderboard</h3> */}
          {/* <h3 className='text-capitalize py-3'>{game.charAt(0).toUpperCase() + game.slice(1)} Stats</h3> */}
          <GroupLeaderboardScores setLatestJoinDate={setLatestJoinDate}/>
        </Col>
      </Row>
      <Row>
        <Col>
          <GroupScoreByDate latestJoinDate={latestJoinDate}/>
        </Col>
      </Row>
    </Container>
  );
}

export default GroupStatsPage;
