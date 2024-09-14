import React, { useState, useRef,  useEffect } from 'react';
import { Container, Row, Col, Button, Overlay, Popover, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Logo from '../../Logo.png';
import TitleLogo from '../../WordleTitleLogo.png'
import Registerform from '../../auth/Registerform';
import { useNavigate } from "react-router-dom";
import Axios from "axios";

const Headerbar = () => {
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
  const userData = USER_AUTH_DATA;
  console.log(userData);
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  const [userid, setUserid] = useState();
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [avatar, setAvatar] = useState();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
      // Simulate a default file (e.g., from an initial value or previous upload)
      const defaultFile = new File([""], "defaultAvatar.png", { type: "image/png" });
      // Set the default file to state
      setAvatar(defaultFile);
  }, []);

  const handleUpload = async (e) => {

      setAvatar(e.target.files[0]);
  }


  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };

  const logout = async (event) => {
    event.preventDefault();
    localStorage.clear();
    window.location.href = '/';
  };

  const login = async (event) => {
    event.preventDefault();
    window.location.href = '/';
  };

  const [isPopupVisible, setPopupVisible] = useState(false);
  const handleOpenPopup = (_id, username, email, password) => {
    setPopupVisible(true);
    setUsername(username);
    setEmail(email);
    setPassword(password);
    setConfirmpassword(password);
    setAvatar(avatar);
    setUserid(_id);
  };

  // Function to close the popup
  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const updateUser = async (event) => {
    const userObject = {
        username: username,
        email: email,
        password: password,
        confirmpassword: confirmpassword,
        avatar: avatar
    }
    console.log(userObject);
    const validation =(userObject) =>{
        const errors = {};

        if(!userObject.username){   
            errors.username = "Username Required";
        }
        if(!userObject.email){   
            errors.email = "Email Required";
        }
        // if(!userObject.password){   
        //     errors.password = "Password Required";
        // }
        // if(!userObject.confirmpassword){   
        //     errors.confirmpassword = "Password Required";
        // }
        return errors;
    }
    setErrors(validation(userObject));
    console.log(userObject);
    try {
        const response = await Axios.put(`https://wordle-server-nta6.onrender.com/use/${userid}`, userObject, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response) {
            console.log('User updated successfully');
        }
    } catch (error) {
        console.error("Error updating user:", error.response ? error.response.data : error.message);
    }
  } 
  

  return (
    <Container>
      <Row className="justify-content-center align-items-center py-2">
        <Col xs={3}>
          <Link to="/">
            <img className='img-fluid' src={Logo} alt="logo" />
          </Link>
        </Col>
        <Col xs={6}>
          <img className='img-fluid d-block m-auto' src={TitleLogo} alt="WordleGamle" />
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
              container={ref}
              containerPadding={20}
            >
              <Popover id="popover-contained">
                <Popover.Body>
                  <div className='text-center'>
                    {!userData || Object.keys(userData).length <= 0 ? (
                      <Button onClick={login}>Login</Button>
                    ) : (
                      <div>
                        <img src={`https://wordle-server-nta6.onrender.com/public/uploads/${userData.avatar}`} alt="User Avatar" className="img-fluid" />
                        <p className='fs-4 m-0'>{userData.username}</p>
                        <p>{userData.email}</p>
                        <div className='user-button'>
                          <Button onClick={()=>handleOpenPopup(userData._id, userData.username, userData.email)}>Profile</Button>
                          <Button onClick={logout}>Logout</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Popover.Body>
              </Popover>
            </Overlay>
          </div>
        </Col>
      </Row>
      {isPopupVisible && (
        <div className="user-profile-popup">
            <Container>
                <Row className='align-content-center justify-content-center'> 
                    <Col md={4} className="user-register-form">
                        <img src={Logo} alt="logo" className='d-block m-auto'></img>
                        <h5>Create New Account</h5>
                        <Form className="js-validation-signup ">
                            <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" className="" value={username} onChange={(e) => { setUsername(e.target.value);}} placeholder='Enter the name'/>
                                {errors.username && <p className='form-validation-error'>{errors.username}</p>}
                            </Form.Group>
                            
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email"  value={email} onChange={(e) => { setEmail(e.target.value);}} placeholder='Enter the email'/>
                                {errors.email && <p className='form-validation-error'>{errors.email}</p>}
                            </Form.Group>

                            <Form.Group >
                                <Form.Label>New Password</Form.Label>
                                <Form.Control type="password" className=""  onChange={(e) => { setPassword(e.target.value);}} placeholder='Enter the password'/>
                                {errors.password && <p className='form-validation-error'>{errors.password}</p>}
                            </Form.Group>
                            <Form.Group >
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control type="password" className=""  onChange={(e) => { setConfirmpassword(e.target.value);}} placeholder='Enter the conform password'/>
                                {errors.confirmpassword && <p className='form-validation-error'>{errors.confirmpassword}</p>}
                            </Form.Group>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label>Profile Picture</Form.Label>
                                <Form.Control type="file" name="avatar" onChange={handleUpload}  />
                            </Form.Group>
                            <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4"  onClick={() => updateUser()} ><i className="fa fa-fw fa-plus mr-1"></i>Update</Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
      )}
      
    </Container>
  );
};

export default Headerbar;
