import { Container, Row, Col } from 'react-bootstrap';
import Logo from '../../Logo.png';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import { USER_AUTH_DATA } from '../../constant/constants';

const Headerbar = () => {

  const userData = USER_AUTH_DATA;
  console.log(userData);
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };
  const logout = async (event) =>{
    localStorage.clear();
    event.preventDefault();
    localStorage.clear();
    window.location.href = '/';
  }
  const login = async (event) =>{
    event.preventDefault();
    window.location.href = '/';
  }
  return (
    <Container>
      <Row className="justify-content-center align-items-center py-2">
        <Col xs={3}>
          <Link to="/"><img className='img-fluid' src={Logo} alt = "logo"></img></Link>
        </Col>
        <Col xs={6}>
          <h2 className='text-center'>WordGAMLE</h2>
        </Col>
        <Col xs={3} className="d-flex justify-content-end">
        <Link to="/wordlestats">
            <svg xmlns="http://www.w3.org/2000/svg" className="m-2 bi bi-bar-chart-fill" width="25" height="25" fill="currentColor"  viewBox="0 0 16 16">
                <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
            </svg> 
          </Link>
          <div ref={ref}>
            <Link onClick={handleClick}><svg xmlns="http://www.w3.org/2000/svg" className="m-2 bi bi-people-fill"  width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
          </svg></Link>
            <Overlay
              show={show}
              target={target}
              placement="bottom"
              container={ref}
              containerPadding={20}
            >
              <Popover id="popover-contained">
                {/* <Popover.Header as="h3">User </Popover.Header> */}
                <Popover.Body>
                  <div className='text-center'>
                    { userData && Object.keys(userData).length <= 0  ? (
                      <Button onClick ={login}>Login</Button>
                      
                  ) : (
                    <div>
                        <img src={`http://localhost:5001/public/uploads/${userData.avatar}`} alt="User Avatar" className="img-fluid" />
                        <p className='fs-4 m-0'>{userData.username}</p>
                        <p>{userData.email}</p>
                        <Button onClick ={logout}>Logout</Button>
                      </div>
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
}

export default Headerbar;
