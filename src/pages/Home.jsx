import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { toast } from 'react-toastify';
import Axios from 'axios';
import FeedbackButton from './FeedbackButton';

function Home() {
    const baseURL = import.meta.env.VITE_BASE_URL;

    const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    // Password Protection State
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
     const handleGamleIntro = () => {
        navigate('/gamleintro');
    };
    const isEmptyObject = userAuthData && Object.keys(userAuthData).length === 0;

    const [homepageText, setHomepageText] = useState({ heading: '', text1: '', text2: '', text3: '' });
    useEffect(() => {
    // Fetch homepage text
    Axios.get(`${baseURL}/user/get-homepage-text.php`)
            .then((res) => {
                if (res.status === 200) {
                    setHomepageText(res.data);
                } else {
                    console.warn("No homepage text found");
                }
            })
            .catch((err) => {
                console.error("Error fetching homepage text:", err);
            });
    }, [baseURL]);
    return isAuthenticated ? (
        <Container className="login-section">
            <Row className="align-content-center justify-content-center text-center">
                <Col md={6} className='bg-white px-3 py-3 text-center'>
                    <Row>
                        <Col>
                            <p className='fs-4 text-center' dangerouslySetInnerHTML={{ __html: homepageText.heading }}></p>
                            <p className='text-center' dangerouslySetInnerHTML={{ __html: homepageText.text1 }}></p>
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
                            <p className='text-center' dangerouslySetInnerHTML={{ __html: homepageText.text2 }}></p>
                            <p className='text-center' dangerouslySetInnerHTML={{ __html: homepageText.text3 }}></p>
                        </Col>
                    </Row>
                    {!userAuthData || isEmptyObject ? (
                        <div>
                            <p className='text-center'>Please create your profile and then click the game buttons and go from there!</p>
                            <Link className="btn btn-primary btn-lg my-3" to="/register" style={{ width: "60%" }}>Create Profile</Link>
                            <Button className="btn-lg mt-3" onClick={loginformClick} style={{ width: "60%" }}>Login</Button>
                        </div>
                    ) : (
                        <div>
                            
                        </div>
                    )}
                </Col>
            </Row>
            
        </Container>
        
    ) : (
        <Container className="login-section">
            <Row className="align-content-center justify-content-center">
                <Col md={6} className='bg-white px-3 py-3 text-center'>
                    <p className='fs-4 text-center'>Enter Password to Access</p>
                    <Form onSubmit={handlePasswordSubmit}>
                        <InputGroup className="my-3">
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <InputGroup.Text
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </InputGroup.Text>
                        </InputGroup>
                        <Button variant="primary" type="submit">Submit</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Home;
