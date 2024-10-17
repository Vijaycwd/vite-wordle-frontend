import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Logo from './Logo.png';
import Connectiongame from './Connectiongame';

function Connctiongamesection() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userData = USER_AUTH_DATA;
    
    return (
        <Col sm={6} className='border p-3 shadow rounded text-center '>
            <Row className='justify-content-center align-items-center'>
            <Col sm={3} className='text-center'><img className='img-fluid shadow p-2 bg-body rounded' src= {Logo}></img></Col>
            <Col sm={6}><Connectiongame loginUserData = {userData}/></Col>
            </Row>
        </Col>
    )
}

export default Connctiongamesection