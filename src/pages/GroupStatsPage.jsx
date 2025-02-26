import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import GroupLeaderboardScores from './GroupLeaderboard/GroupLeaderboardScores';

function GroupStatsPage() {
  const { groupName, game } = useParams(); // Extract groupName and game from URL
 
  const formattedGroupName = decodeURIComponent(groupName).replace(/-/g, ' ');
  
  return (
    <Container>
      <Row>
        <Col className="text-center mt-4">
          <h2 className='text-capitalize py-2'>{decodeURIComponent(formattedGroupName)}</h2>
          <h3 className='text-capitalize py-3'>{game} Stats</h3>
          {/* <h3 className='text-capitalize py-3'>{game.charAt(0).toUpperCase() + game.slice(1)} Stats</h3> */}


          {/* Render content based on selected game */}
          {game === "wordle" && <GroupLeaderboardScores/>}
          {game === "connections" && <p>Connections statistics go here.</p>}
          {game === "phrazle" && <p>Phrazle statistics go here.</p>}
        </Col>
      </Row>
    </Container>
  );
}

export default GroupStatsPage;
