import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function GamesStat() {
    const navigate = useNavigate();
    
    const handleNavigation = (game) => {
        navigate(`/${game}`);
    };
        
    return (
        <Container>
            <Row className="justify-content-center align-items-center pt-5">
                <Col md={6} className="border p-3 shadow rounded text-center">
                    <h3>Games State</h3>
                    <Row>
                        <Col className="text-center py-3">
                            <div className="my-3">
                                <Button className="btn btn-primary btn-lg" onClick={() => handleNavigation('wordlestats')}>
                                    Wordle
                                </Button>
                            </div>
                        </Col>
                        <Col className="text-center py-3">
                            <div className="my-3">
                                <Button className="btn btn-primary btn-lg" onClick={() => handleNavigation('connectionstats')}>
                                    Connections
                                </Button>
                            </div>
                        </Col>
                        <Col className="text-center py-3">
                            <div className="my-3">
                                <Button className="btn btn-primary btn-lg" onClick={() => handleNavigation('phrazlestats')}>
                                    Phrazle
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default GamesStat;
