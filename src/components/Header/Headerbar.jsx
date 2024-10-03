import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Button, Overlay, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Logo from '../../Logo.png';
import TitleLogo from '../../WordleTitleLogo.png';
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css'; 

const Headerbar = () => {
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const userData = USER_AUTH_DATA;
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };

  const logout = async (event) => {
    event.preventDefault();
    setShow(false);
    localStorage.clear();
    navigate('/');
  };

  const login = async (event) => {
    event.preventDefault();
    setShow(false);
    navigate('/');
  };

  const editUser = (username, email, id, isEditing) => {
    setShow(false);
    navigate('/edit-profile', {
      state: { username, email, id, isEditing }
    });
  };

  // Close Popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <Container>
      <Row className="justify-content-center align-items-center py-2">
        <Col xs={3}>
          <Link to="/">
            <img className='img-fluid' src={Logo} alt="logo" />
          </Link>
        </Col>
        <Col xs={6}>
          <img className='img-fluid d-block m-auto' src={TitleLogo} alt="WordleGame" />
        </Col>
        <Col xs={3} className="d-flex justify-content-end">
          <Link to="/wordlestats">
            <svg xmlns="http://www.w3.org/2000/svg" className="m-2 bi bi-bar-chart-fill" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" />
            </svg>
          </Link>
          <div ref={ref}>
            <Link onClick={handleClick}>
              <svg xmlns="http://www.w3.org/2000/svg" className="m-2 bi bi-people-fill" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
              </svg>
            </Link>
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
                    {!userData || Object.keys(userData).length <= 0 ? (
                      <Button onClick={login}>Login</Button>
                    ) : (
                      <>
                        <div>
                          <img src={`https://wordle-server-nta6.onrender.com/public/uploads/${userData.avatar}`} alt="User Avatar" className="img-fluid" />
                          <p className='fs-4 m-0'>{userData.username}<i className="fa fa-edit fa fa-edit edit-icon" onClick={() => editUser(userData.username, userData.email, userData._id, true)}></i></p>
                          <p>{userData.email}</p>
                          <div className="user-profile-button">
                            <Button onClick={() => editUser(userData.username, userData.email, userData._id, true)}>Edit</Button>
                            <Button onClick={logout}>Logout</Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Popover.Body>
              </Popover>
            </Overlay>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Headerbar;
