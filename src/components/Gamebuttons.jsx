import { React, useState, useEffect } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import Wordlelogo from './images/wordle.png'
import Connectionlogo from './images/connections.jpg'
import Wordlegame from './Wordlegame'
import Axios from "axios";
function Gamebuttons() {
  const userAuthData = JSON.parse(localStorage.getItem('auth'));
  console.log(userAuthData);
  const userData = userAuthData;
    
    //   console.log('User Data State:', userdata.username);

    return (
        <Container>
           <Row className="justify-content-center align-items-center">
                <Col md={6} className='text-center py-3'>
                    <h2>{"Welcome "+userData.username+"!"}</h2>
                </Col>
           </Row>
            <Row className="justify-content-center align-items-center">
                <Col md={6} className='border p-3 shadow rounded'>
                    <Row className='justify-content-center align-items-center'>
                        <Col md={3} className='shadow p-2 bg-body rounded'>
                            <img className='img-fluid' src= {Wordlelogo}></img>
                        </Col>
                        <Col md={8}>
                            <Wordlegame loginUserData = {userData}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
            
        </Container>
    )
}

export default Gamebuttons 