import React, { useContext } from 'react';
import { UserContext } from '../constant/UserContext';
import { Col, Container, Row } from 'react-bootstrap'
import Wordlelogo from './images/wordle.png'
import Connectionlogo from './images/connections.jpg'
import Wordlegame from './Wordlegame'
import Axios from "axios";
function Gamebuttons() {
    const userAuthData = useContext(UserContext);
    const userData = userAuthData;
//   const userAuthData = JSON.parse(localStorage.getItem('auth'));
//   console.log(userAuthData);
//   const userData = userAuthData;
    
    console.log('User Data State:', userData.username);

    return (
        <Container>
           <Row className="justify-content-center align-items-center">
                <Col sm={6} className='text-center py-3'>
                    <h2>{"Welcome "+userData.username+"!"}</h2>
                </Col>
           </Row>
            <Row className="justify-content-center align-items-center">
                <Col sm={6} xs={12} className='border p-3 shadow rounded'>
                    <Row className='justify-content-center align-items-center'>
                    <Col sm={6} xs={4}><img className='img-fluid shadow p-2 bg-body rounded' src= {Wordlelogo}></img></Col>
                    <Col sm={6} xs={8}><Wordlegame loginUserData = {userData}/></Col>
                    </Row>
                </Col>
            </Row>
            
        </Container>
    )
}

export default Gamebuttons 