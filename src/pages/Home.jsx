import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { toast } from 'react-toastify';

function Home() {
    const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
    const navigate = useNavigate();
    
    // Password Protection State
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const correctPassword = "Casa"; // Change this

    // Check if the user already entered the password
    useEffect(() => {
        if (localStorage.getItem("pageUnlocked") === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password === correctPassword) {
            setIsAuthenticated(true);
            localStorage.setItem("pageUnlocked", "true"); // Store authentication
        } else {
            toast.error("Incorrect password!");
        }
    };

    const handleNavigation = (link) => {
        navigate(`/${link}`);
    };
    const groupClick = (link) => {
        navigate('/groups');
    };
    
    const loginformClick = () => {
        navigate('/login');
    };
    
    const isEmptyObject = userAuthData && Object.keys(userAuthData).length === 0;

    return isAuthenticated ? (
        <Container className="login-section">
            <Row className="align-content-center justify-content-center">
                <Col md={6} className='bg-white px-3 py-3 text-center'>
                    <Row>
                        <Col>
                            <p className='fs-4 text-center'>Welcome to <b>WordGAMLE!</b></p>
                            <p className='text-center'>Welcome to the very first beta version of WordGAMLE! Click on each game to see how to store your results in the site.</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center py-1" md={4} s={12}>
                            <Button className="btn-lg" onClick={() => handleNavigation('wordle')}>Wordle</Button>
                        </Col>
                        <Col className="text-center py-1" md={4} s={12}>
                            <Button className="btn-lg" onClick={() => handleNavigation('connections')}>Connections</Button>
                        </Col>
                        <Col className="text-center py-1" md={4} s={12}>
                            <Button className="btn-lg" onClick={() => handleNavigation('phrazle')}>Phrazle</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="py-3">
                            <p className='text-center'>Invite friends to the site and then create your group(s) by clicking the Group button up top.</p>
                            <p className='text-center'>Then, when you store results here each day, you’ll see your group’s daily Leaderboards… with more fun to come over time!</p>
                        </Col>
                    </Row>
                    {!userAuthData || isEmptyObject ? (
                        <div>
                            <p className='text-center'>Please create your profile and then click the game buttons and go from there!</p>
                            <Link className="btn btn-primary btn-lg my-3" to="/register" style={{ width: "60%" }}>Create Profile</Link>
                            <Button className="btn-lg mt-3" onClick={loginformClick} style={{ width: "60%" }}>Login</Button>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </Col>
            </Row>
        </Container>
    ) : (
        <Container className="login-section">
            <Row className="align-content-center justify-content-center">
                <Col md={6} className='bg-white px-3 py-3 text-center'>
                    <p className='fs-4 text-center'>Enter Password to Access</p>
                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            className="form-control my-3"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button className="btn btn-primary" type="submit">Submit</Button>
                    </form>
                </Col>
            </Row>
        </Container>
    );
}

export default Home;
