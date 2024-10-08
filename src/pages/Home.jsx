import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';  // Make sure this is imported

function Home() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userAuthData = USER_AUTH_DATA;
    const navigate = useNavigate();
    
    const loginformClick = () => {
        navigate('/login');
    }
    const isEmptyObject = userAuthData && Object.keys(userAuthData).length === 0;

    return (
        <>
            <Container className="login-section">
                <Row className="align-content-center justify-content-center">
                    <Col md={4} className='bg-white px-5 py-3 text-center'>
                        <p className='fs-4 text-center'>Welcome to <b>WordGAMLE!</b></p>
                        <p className='text-center'>Soon we’ll be playing various games and creating groups and leaderboards.  But, for now we’re just playing Wordle and storing results.
                        </p>
                        <Link className="btn btn-primary btn-lg my-3" to="/wordle">Wordle</Link>
                        {!userAuthData || isEmptyObject ? (
                            <>
                                <div>
                                    <p className='text-center'>Please create your profile and then click the Wordle button and go from there!</p>
                                    <Link className="btn btn-primary btn-lg my-3" to="/register" style={{width:"60%"}}>Create Profile</Link>
                                    <Button className="btn btn-primary btn-lg mt-3" onClick={loginformClick} style={{width:"60%"}}>Login
                                        </Button>
                                </div>
                            </>
                        ) : (
                            <div></div>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Home;
