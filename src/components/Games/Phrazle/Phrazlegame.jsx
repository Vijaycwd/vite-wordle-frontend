import React from 'react';
import { Row, Col, Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhrazlePlayService from './PhrazlePlayService';

const Phrazlegame = () => {
    const navigate = useNavigate();

    const handleWordlestate = async (event) => {
        event.preventDefault();
        navigate('/Phrazlestats');
    };
    
    return (
        <>
            <ToastContainer />
            <Row>
                <Col>
                    <PhrazlePlayService/>
                </Col>
                <Col>
                    <div className="my-3">
                        <Button className="phrazle-btn px-5" onClick={handleWordlestate}>
                            Stats
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Phrazlegame;
