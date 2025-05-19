import React from 'react';
import { Row, Col, Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import WordlePlayService from './WordlePlayService';

const Wordlegame = () => {
    const navigate = useNavigate();

    const handleWordlestate = async (event) => {
        event.preventDefault();
        navigate('/wordlestats');
    };
    
    return (
        <>
            <Row>
                <Col>
                    <WordlePlayService/>
                </Col>
                <Col>
                    <div className="my-3">
                        <Button className="wordle-btn px-5" onClick={handleWordlestate}>
                            Stats
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Wordlegame;
