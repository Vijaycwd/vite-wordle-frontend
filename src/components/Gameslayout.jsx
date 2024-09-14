import React, { useState, useEffect, useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Wordlegamesection from './Games/Wordle/Wordlegamesection';
import { UserContext } from '../constant/UserContext'; 

function Gameslayout() {

  const { userDatadetails } = useContext(UserContext);
  console.log(userDatadetails);

  return (
    <Container>
      <Row className="justify-content-center align-items-center">
        <Col className="text-center py-3">
          <h2>{"Welcome " + userData.username + "!"}</h2>
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
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Gameslayout;
