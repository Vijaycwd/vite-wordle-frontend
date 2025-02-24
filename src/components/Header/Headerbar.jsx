import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Button, Overlay, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Logo from '../../Logo.png';
import TitleLogo from '../../WordleTitleLogo.png';
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import axios from 'axios';
import NotificationBar from './NotificationBar';  // import NotificationBar
import { Toast } from 'react-bootstrap';
import GroupInvites from '../../pages/GroupInvites';

const Headerbar = () => {
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const userEmail = USER_AUTH_DATA?.email;
  const [userData, setUserData] = useState({});
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const [showNotification, setShowNotification] = useState(false);  // State to control notification visibility
  const [notificationMessage, setNotificationMessage] = useState('');  // State to hold notification message
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userEmail) {
      axios.get('https://coralwebdesigns.com/college/wordgamle/user/get-user.php', {
        params: { useremail: userEmail },
      })
      .then(response => {
        setUserData(response.data.user);  // Assumes response has user details in `data`
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
    navigate('/');
    setNotificationMessage('You have successfully logged out.');
    setShowNotification(true);  // Show notification when user logs out
  };

  const login = async (event) => {
    event.preventDefault();
    setShow(false);
    navigate('/login');
  };

  const editUser = (username, email, id, avatar, isEditing) => {
    setShow(false);
    navigate('/edit-profile', {
      state: { username, email, id, avatar, isEditing }
    });
  };

  return (
    <Container>
      <Row className="align-items-center py-2 justify-content-end ">
        <Col md={2} xs={3}>
          <Link to="/">
            <img className='img-fluid' src={Logo} alt="logo" />
          </Link>
        </Col>
        <Col md={10} xs={9} className='d-flex justify-content-end align-items-center gap-2'>
          <Link to="/" className='btn btn-primary'>
            Games
          </Link>
          <Link to="/groups" >
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-people-fill" width="40" height="40" fill="#00BF63"  viewBox="0 0 640 512">
              <path d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3l0-84.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5l0 21.5c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-26.8C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112l32 0c24 0 46.2 7.5 64.4 20.3zM448 416l0-21.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176l32 0c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2l0 26.8c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7l0 84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3l0-84.7c-10 11.3-16 26.1-16 42.3zm144-42.3l0 84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2l0 42.8c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-42.8c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112l32 0c61.9 0 112 50.1 112 112z"/>
            </svg>
          </Link>
          <GroupInvites />
          <Link onClick={handleClick}>
            <div ref={ref}>
            <svg xmlns="http://www.w3.org/2000/svg" className=" bi bi-bar-chart-fill" width="25" height="25" fill="#00BF63" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg> 
            </div>
          </Link>
          {/* <Link to="/gamesstat">
            <svg xmlns="http://www.w3.org/2000/svg" className="m-2 bi bi-bar-chart-fill" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" />
            </svg>
          </Link> */}
          
          
            
          
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
            <div className='text-center'>
              {!USER_AUTH_DATA ? (
                <Button onClick={login}>Login</Button>
              ) : (
                <>
                  <div>
                    <img 
                      src={`https://coralwebdesigns.com/college/wordgamle/user/uploads/${userData.avatar}`} 
                      alt="User Avatar" 
                      width="30px"
                      height="30px"
                      className="img-fluid" 
                      onError={(e) => e.target.src = 'https://coralwebdesigns.com/college/wordgamle/user/uploads/default_avatar.png'}
                    />
                    <p className='fs-4 m-0 cwd-edit-profile' onClick={() => editUser(userData.username, userData.email, userData.id, userData.avatar, true)}>{userData.username}</p>
                    <p>{userData.email}</p>
                    <div className="user-profile-button">
                      <Button onClick={() => editUser(userData.username, userData.email, userData.id, true)}>Edit</Button>
                      <Button onClick={logout}>Logout</Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Popover.Body>
        </Popover>
      </Overlay>
    </Container>
  );
};

export default Headerbar;
