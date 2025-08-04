import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Button, Overlay, Popover,  Navbar,Nav, } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Logo from '../../Logo.png';
import TitleLogo from '../../WordleTitleLogo.png';
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import axios from 'axios';
import GroupInvites from '../../pages/GroupInvites';
import FeedbackButton from '../../pages/FeedbackButton';


const Headerbar = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const userId = USER_AUTH_DATA?.id;
  const userEmail = USER_AUTH_DATA?.email;
  const userAvatar = USER_AUTH_DATA?.avatar; 
  const [userData, setUserData] = useState({});
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const [showNotification, setShowNotification] = useState(false);  // State to control notification visibility
  const [notificationMessage, setNotificationMessage] = useState('');  // State to hold notification message
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState();
  const collapseRef = useRef();

  useEffect(() => {
  if (userEmail?.trim()) {
    axios.get(`${baseURL}/user/get-user.php`, {
      params: { useremail: userEmail },
    })
    .then(response => {
      setUserData(response.data.user || {});
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
  }
}, [userEmail]);


  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };

  const handleOutsideClick = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [show]);
  
  const handleNotificationClick = () => {
    setShowNotificationPanel(!showNotificationPanel);  // Toggle notification panel visibility
  };
  const logout = async (event) => {
    event.preventDefault();
    setShow(false);
    localStorage.removeItem('auth');
    setUserData({}); 
    navigate('/login');
    setNotificationMessage('You have successfully logged out.');
    setShowNotification(true);  // Show notification when user logs out
  };

  const login = async (event) => {
    event.preventDefault();
    setShow(false);
    navigate('/login');
  };

  const gamleIntro = async (event) => {
    event.preventDefault();
    setShow(false);
    navigate('/gamleintro');
  };

  const faq = async (event) => {
    event.preventDefault();
    setShow(false);
    navigate('/faq');
  };

  const editUser = (username, email, id, avatar, isEditing) => {
    setShow(false);
    navigate('/edit-profile', {
      state: { username, email, id, avatar, isEditing }
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        collapseRef.current &&
        !collapseRef.current.contains(event.target) &&
        !event.target.closest('.navbar-toggler')
      ) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [expanded]);
const handleInviteFriends = async () => {
  const frontendURL = window.location.origin;
  const encryptedUserId = btoa(userId);
  const useridpath = `/?user_id=${encryptedUserId}`;
  const fullUrl = `${frontendURL}${useridpath}`;
  const fullName = userData.first_name && userData.last_name
  ? `${userData.first_name} ${userData.last_name}`
  : 'A friend';

  const message = `${fullName} has invited you to create an account on WordGAMLE.com\n\n👉 Enter ‘Casa’ (case sensitive) to get into the site!`;

  const shareData = {
    title: 'Join WordGAMLE!',
    text: message,
    url: fullUrl,
  };

  if (navigator.share) {
    console.log(message);
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

  return (

    <Container className='header-section'>
      <Row className="align-items-center py-2 justify-content-end ">
        <Col md={2} xs={3}>
          <Link to="/">
            <img className='img-fluid' src={Logo} alt="logo" />
          </Link>
        </Col>
        <Col md={10} xs={9} className='d-flex justify-content-end align-items-center gap-2'>

          <Link to="/" className='btn btn-primary game-btn'>
            Games
          </Link>
          <Link to="/groups" >
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-people-fill" width="30" height="30" fill="#00BF63"  viewBox="0 0 640 512">
              <path d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3l0-84.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5l0 21.5c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-26.8C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112l32 0c24 0 46.2 7.5 64.4 20.3zM448 416l0-21.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176l32 0c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2l0 26.8c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7l0 84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3l0-84.7c-10 11.3-16 26.1-16 42.3zm144-42.3l0 84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2l0 42.8c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-42.8c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112l32 0c61.9 0 112 50.1 112 112z"/>
            </svg>
          </Link>
          {userEmail && <GroupInvites />}
          {userEmail === "cassandradroogan@gmail.com" && (
            <>
            <Link to="/admin-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#00BF63" viewBox="0 0 512 512">
                <path d="M78.6 5C69.1-2.4 55.6-1.5 47 7L7 47c-8.5 8.5-9.4 22-2.1 31.6l80 104c4.5 5.9 11.6 9.4 19 9.4l54.1 0 109 109c-14.7 29-10 65.4 14.3 89.6l112 112c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-112-112c-24.2-24.2-60.6-29-89.6-14.3l-109-109 0-54.1c0-7.5-3.5-14.5-9.4-19L78.6 5zM19.9 396.1C7.2 408.8 0 426.1 0 444.1C0 481.6 30.4 512 67.9 512c18 0 35.3-7.2 48-19.9L233.7 374.3c-7.8-20.9-9-43.6-3.6-65.1l-61.7-61.7L19.9 396.1zM512 144c0-10.5-1.1-20.7-3.2-30.5c-2.4-11.2-16.1-14.1-24.2-6l-63.9 63.9c-3 3-7.1 4.7-11.3 4.7L352 176c-8.8 0-16-7.2-16-16l0-57.4c0-4.2 1.7-8.3 4.7-11.3l63.9-63.9c8.1-8.1 5.2-21.8-6-24.2C388.7 1.1 378.5 0 368 0C288.5 0 224 64.5 224 144l0 .8 85.3 85.3c36-9.1 75.8 .5 104 28.7L429 274.5c49-23 83-72.8 83-130.5zM56 432a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/>
              </svg>
            </Link>
            <Link to="/users-list">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#00BF63" viewBox="0 0 640 512">
                <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z"/>
              </svg>
            </Link>
            </>
          )}
      <Navbar expand="lg" expanded={expanded} onToggle={setExpanded}>
        <Navbar.Toggle
          className="p-0 border-0 shadow-none"
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded((prev) => !prev)}
        />
          <Navbar.Collapse id="basic-navbar-nav" ref={collapseRef}>
                <Nav className="align-items-center">
                  <div role="button" onClick={handleClick}>
                    <div ref={ref}>
                      {userData.avatar ? (
                         <img 
                          src={`${baseURL}/user/uploads/${userData.avatar}`}
                          alt="User Avatar" 
                          width="30"
                          height="30"
                          className="img-fluid user-avatar rounded-circle mb-2"
                          onError={(e) => (e.target.style.display = 'none')}
                        />

                      ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-bar-chart-fill" width="18" height="18" fill="#00BF63" viewBox="0 0 448 512">
                          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </Nav>
                <Nav className="ms-auto align-items-center">
                  <Button className="game-btn m-2" onClick={() => { setExpanded(false); navigate('/gamleintro'); }}>
                    Gamle Intro
                  </Button>
                  <Button className="game-btn m-2" onClick={handleInviteFriends}>
                    Invite Friends
                  </Button>
                  <FeedbackButton />
                  <Button className="game-btn m-2" onClick={() => { setExpanded(false); navigate('/faq'); }}>
                    FAQ
                  </Button>

                </Nav>
              </Navbar.Collapse>
          </Navbar>
        </Col>
      </Row>
      <Row className="justify-content-center align-items-center py-2">
        <Col xs={8}>
          <Link to="/">
            <img className='img-fluid d-block m-auto' src={TitleLogo} alt="WordleGame" />
          </Link>
        </Col>
      </Row>
      <Overlay
        show={show}
        target={target}
        placement="bottom"
        container={ref.current}
        containerPadding={20}
      >
        <Popover id="popover-contained">
          <Popover.Body>
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-12 text-center">
                  {!USER_AUTH_DATA ? (
                    <Button onClick={login}>Login</Button>
                  ) : (
                    <>
                      <div>
                        <img
                            src={
                                userData.avatar
                                    ? `${baseURL}/user/uploads/${userData.avatar}`
                                    : `${baseURL}/user/uploads/default_avatar.png`
                            }
                            alt="Profile"
                            className="rounded-circle mb-1"
                            style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                        />
                        <p className='fs-4 m-0 cwd-edit-profile' onClick={() => editUser(userData.name, userData.username, userData.email, userData.id, userData.avatar, true)}>
                          {userData.username}
                        </p>
                        <p>{userData.email}</p>
                        <div className="user-profile-button d-flex justify-content-center gap-2 mt-2">
                          <Button onClick={() => editUser(userData.name, userData.username, userData.email, userData.id, true)}>Edit</Button>
                          <Button onClick={logout}>Logout</Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Popover.Body>
        </Popover>

      </Overlay>
    </Container>
  );
};

export default Headerbar;