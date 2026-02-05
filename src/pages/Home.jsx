import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal, Carousel } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { toast } from 'react-toastify';
import Axios from 'axios';
import FeedbackButton from './FeedbackButton';
import { useLocation } from 'react-router-dom';
import TitleLogo from '../../src/WordleTitleLogo.png';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, FreeMode } from "swiper/modules";
import { FaRunning, FaDumbbell, FaTree } from "react-icons/fa"; // Example icons
import GroupScoreByDate from "../pages/GroupLeaderboard/GroupScoreByDate";
import dayjs from "dayjs";

function Home() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
     const userId = userAuthData?.id;
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    // Password Protection State
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const correctPassword = "Casa"; // Change this
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const encryptedId = params.get('group_id');
    const groupId = encryptedId;
    const registerPath = groupId ? `/register?group_id=${groupId}` : `/register`;
    const [allGroup, setAllGroup] = useState([]);

    const formattedDate = dayjs().format("YYYY-MM-DD");

    
    // //get all group id
    // useEffect(() => {
    // const fetchUserGroups = async () => {
    //     try {
    //     // 1️⃣ Get all user groups
    //     const res = await Axios.get(`${baseURL}/groups/get-user-groups-data.php`, {
    //         params: { user_id: userId },
    //     });
        
    //     const groups = res.data; // assuming this is an array of groups
       

    //     // 2️⃣ Fetch data for each group individually
    //     const groupDetailsPromises = groups.map(group =>
    //         Axios.get(`${baseURL}/groups/get-all-game-current-group-score.php`, {
    //         params: {
    //             user_id: userId,
    //             groupId: group.id,
    //             game: group.selected_games.toLowerCase(),
    //             today: "2025-12-10"
    //             }
    //         })
    //     );

    //     const groupDetailsResponses = await Promise.all(groupDetailsPromises);

    //     // 3️⃣ Extract data from each response
    //     const detailedGroups = groupDetailsResponses.map(res => res.data);

    //     // 4️⃣ Update state once
    //     setAllGroup(detailedGroups);

    //     } catch (error) {
    //     console.error("Error fetching user joined groups:", error);
    //     }
    // };

    // if (userId) fetchUserGroups();
    // }, [userId]);





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

    const cleanText = homepageText.text1
    .replace(/<[^>]*>/g, '')         // remove HTML tags
    .replace(/&nbsp;/g, ' ')         // replace &nbsp; with space
    .replace(/\s+/g, ' ')            // optional: collapse multiple spaces
    .trim();    
    const parts = cleanText.split('[Invite Friends]');

    const inviteFriends = async () => {
        const frontendURL = window.location.origin;
        const fullName = userAuthData.firstname && userAuthData.lastname
        ? `${userAuthData.firstname} ${userAuthData.lastname}`
        : 'A friend';

        const message = `${fullName} has invited you to create an account on WordGAMLE.com\n\n👉 Enter ‘Casa’ (case sensitive) to get into the site!`;

        const shareData = {
            title: 'Join WordGAMLE!',
            text: message,
            url: frontendURL,
        };

        if (navigator.share) {
            
            try {
            await navigator.share(shareData);
            
            } catch (err) {
            console.error('Share failed:', err);
            }
        } else {
            try {
            await navigator.clipboard.writeText(`${message}\n${shareData.url}`);
            alert('Invite message copied to clipboard!');
            } catch (err) {
            alert('Could not copy. Please share manually.');
            }
        }
    };
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        // Helper
        const formatLocalDateTime = (date) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
                + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        let todayFormatted = "";
        let yesterdayFormatted = "";

       
        //get all group id
        useEffect(() => {
        const fetchUserGroups = async () => {
            try {
            const response = await Axios.get(`${baseURL}/groups/get-user-groups-data.php`, {
                params: { user_id: userId },
            });
            setAllGroup(response.data);
            
            } catch (error) {
            console.error("Error fetching user joined groups:", error);
            }
        };
    
        if (userId) fetchUserGroups();
        }, [userId]);
        
       useEffect(() => {
        if (!userAuthData?.id) return;
        const localDate = new Date();
        const offsetMinutes = localDate.getTimezoneOffset();
        const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60000);
        const todayFormatted = adjustedDate.toISOString().slice(0, 10);
        const hours = localDate.getHours();
        const groupPeriod = hours < 12 ? "AM" : "PM";

        const groupGameMap = allGroup.map(group => ({
          groupId: group.id,
          selectedGame: group.selected_games
        }));

        const params = { 
            baseURL: baseURL,
            user_id: userAuthData.id,  
            today: todayFormatted,
            period: groupPeriod,
            game: groupGameMap,
            createdat : formatLocalDateTime(today)
        };
        Axios.get(`${baseURL}/user/get-day-winner.php`, { params })
        }, [userAuthData?.id]);

    return isAuthenticated ? (
        <Container className="login-section">
            <Row className="justify-content-center align-items-center py-2 text-center">
                <Col xs={8}>
                    <Link to="/">
                    <img className='img-fluid' src={TitleLogo} alt="WordleGame" />
                    </Link>
                </Col>
            </Row>
            <Row className="align-content-center justify-content-center text-center">
                <Col md={6} className='bg-white px-3 py-3 text-center'>
                    <Row>
                        <Col>
                            
                            {!userAuthData || isEmptyObject ? (

                                <>
                                    {/* Content for users who have NOT created an account */}
                                    <p className='fs-4 text-center' dangerouslySetInnerHTML={{ __html: homepageText.heading_pre }}></p>
                                    <div dangerouslySetInnerHTML={{ __html: homepageText.text1_pre }} />
                                    <Row className='custom-button-row pb-3'>
                                        <Col>
                                            <Link className="btn btn-primary my-2 w-100" to={registerPath}>Create Account</Link>
                                        </Col>
                                        <Col>
                                            <Button className="my-2 w-100 white-btn" onClick={loginformClick}>Log In</Button>
                                        </Col>
                                    </Row>
                                    <Row className="pb-3">
                                        <Col className="">
                                            <p className="text-center m-0">
                                                {parts[0]}
                                                <a href="#" onClick={inviteFriends}> Invite Friends</a>
                                                {parts[1]}
                                            </p>
                                        </Col>
                                    </Row>
                                    <Row className="cwd-swiper-animation custom-button-row">
                                        <Col className="text-center py-1" md={4} s={12}>
                                            <Button className="wordle-btn w-100" onClick={() => handleNavigation('wordle')}>Wordle</Button>
                                        </Col>
                                        <Col className="text-center py-1" md={4} s={12}>
                                            <Button className="connections-btn w-100" onClick={() => handleNavigation('connections')}>Connections</Button>
                                        </Col>
                                        <Col className="text-center py-1" md={4} s={12}>
                                            <Button className="phrazle-btn w-100" onClick={() => handleNavigation('phrazle')}>Phrazle</Button>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="py-3">
                                            <p className='text-center m-0' dangerouslySetInnerHTML={{ __html: homepageText.text2 }}></p>
                                        </Col>
                                    </Row>
                                </>
                            ) : (
                                <>
                                    {/* Content for users who HAVE created an account */}
                                    <p className='fs-4 text-center' dangerouslySetInnerHTML={{ __html: homepageText.heading_post }}></p>
                                    <div dangerouslySetInnerHTML={{ __html: homepageText.text1_post }} />
                                    <Row className="cwd-swiper-animation custom-button-row">
                                        <Col className="text-center py-1" md={4} s={12}>
                                            <Button className="wordle-btn w-100" onClick={() => handleNavigation('wordle')}>Wordle</Button>
                                        </Col>
                                        <Col className="text-center py-1" md={4} s={12}>
                                            <Button className="connections-btn w-100" onClick={() => handleNavigation('connections')}>Connections</Button>
                                        </Col>
                                        <Col className="text-center py-1" md={4} s={12}>
                                            <Button className="phrazle-btn w-100" onClick={() => handleNavigation('phrazle')}>Phrazle</Button>
                                        </Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col className="">
                                            <p className="text-center">
                                                {parts[0]}
                                                <a href="#" onClick={inviteFriends}> Invite Friends</a>
                                                {parts[1]}
                                            </p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="">
                                            <p className='text-center' dangerouslySetInnerHTML={{ __html: homepageText.text2 }}></p>
                                        </Col>
                                    </Row>
                                </>
                            )}

                        </Col>
                    </Row>
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
