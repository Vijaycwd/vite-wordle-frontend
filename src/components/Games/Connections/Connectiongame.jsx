import React from 'react';
import { Row, Col, Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ConnectionPlayService from './ConnectionPlayService';

const Connectiongame = () => {
    const navigate = useNavigate();

    const handleWordlestate = async (event) => {
        event.preventDefault();
        navigate('/connectionstats');
    };
    
    return (
        <>
            <Row>
                <Col>
                    <ConnectionPlayService/>
                </Col>
                <Col>
                    <div className="my-3">
                        <Button className="connections-btn px-5" onClick={handleWordlestate}>
                            Stats
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Connectiongame;
