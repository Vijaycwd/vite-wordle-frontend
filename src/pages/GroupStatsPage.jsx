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

          <GroupLeaderboardScores/>
        </Col>
      </Row>
    </Container>
  );
}

export default GroupStatsPage;
