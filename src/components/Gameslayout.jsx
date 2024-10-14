import React from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap'
import Wordlegamesection from './Games/Wordle/Wordlegamesection';

function Gameslayout() {
  const userAuthData = JSON.parse(localStorage.getItem('auth'));
  const userData = userAuthData;
    
    // console.log('User Data State:', userData.username);

    return (
        <Container>
           <Row className="justify-content-center align-items-center">
                <Col  className='text-center py-3'>
                  {userData ? (
                    <h2>{"Welcome "+userData.username+"!"}</h2>
                  ):(
                    <h2>{"Welcome Guest!"}</h2>
                  )}
                    
                </Col>
           </Row>
           <Row className="justify-content-center align-items-center">
            <Wordlegamesection/>  
            </Row>
            <Row className="justify-content-center align-items-center">
              <Col md={6} className='py-5'>
                <div>
                  <p>Click the “Play” button to go to the Wordle website and play. Then:</p>
                  <ol>
                    <li><strong>PLAY:</strong> Play Wordle</li>
                    <li><strong>COPY:</strong> Click SHARE, then COPY to copy your Wordle result</li>
                    <li><strong>PASTE:</strong> Navigate back to WordGAMLE.com to paste your Wordle result</li>
                  </ol>
                  <Row className="d-flex justify-content-center">
                    <Col md={8}>
                      <p className="message">*For anyone who has already  played and has the  Result copied, click the “Enter Result” button to enter today’s game result.</p>
                    </Col>
                    <Col md={4}>
                      <Button>Enter Result</Button>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
        </Container>
    )
}

export default Gameslayout 