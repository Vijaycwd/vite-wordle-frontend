import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Logo from '../Logo.png';

function Loginform() {
    const userAuthData = JSON.parse(localStorage.getItem('auth')); // Change here
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    console.log(userAuthData);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const showLoginformClick = () => {
        setShowLoginForm(!showLoginForm);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            setValidated(true);
        } else {
            setEmail('');
            setPassword('');
            const userObject = { email, password };
            Axios.post('https://coralwebdesigns.com/college/wordgamle/auth/login.php', userObject)
                .then(res => {
    
                    if (res.data.status === 'success') {
                        toast.success("Login Successfully", { position: "top-center" });
                        localStorage.setItem('auth', JSON.stringify(res.data));
                        navigate("/wordle");
                    } else {
                        toast.error("Invalid user email and password!", { position: "top-center" });
                    }
                })
                .catch(() => {
                    toast.error("Invalid User Details", { position: "top-center" });
                });
        }
    };

    const isEmptyObject = userAuthData && Object.keys(userAuthData).length === 0;
    
    return (
        <>
            <ToastContainer />
            <Container className="login-section">
                <Row className="align-content-center justify-content-center">
                    <Col md={4} className='bg-white px-5 py-3 text-center'>
                        {!userAuthData || isEmptyObject ? (
                                        <div>
                                        <h4 className='my-4'>Login</h4>
                                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                            <Row className="mb-3">
                                                <Col>
                                                    <Form.Group controlId="login-email">
                                                        <InputGroup hasValidation>
                                                            <Form.Control
                                                                type="email"
                                                                placeholder="Email"
                                                                required
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                value={email}
                                                                name="login-email"
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                Please enter an email.
                                                            </Form.Control.Feedback>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row className="mb-3">
                                                <Col>
                                                    <Form.Group controlId="login-password">
                                                        <InputGroup>
                                                            <Form.Control
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="Password"
                                                                required
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                value={password}
                                                                name="login-password"
                                                            />
                                                            <InputGroup.Text>
                                                                <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"} onClick={togglePasswordVisibility}></i>
                                                            </InputGroup.Text>
                                                            <Form.Control.Feedback type="invalid">
                                                                Please enter a password.
                                                            </Form.Control.Feedback>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Button type="submit">
                                                <i className="fa fa-fw fa-sign-in-alt mr-1"></i>Login
                                            </Button>
                                        </Form>
                                        <div className='btn-section my-3'>
                                            <Link className="btn btn-sm btn-light d-block d-lg-inline-block mb-1 float-right" to="/reset-password">
                                                <i className="fa fa-exclamation-triangle text-muted mr-1"></i> Forgot password
                                            </Link>
                                        </div>
                                        </div> 
                        ) : (
                            <div>
                                <h2 className='my-2'>{"Welcome "+userAuthData.username+"!"}</h2>
                                <p className='my-3'>You are successfully logged in.</p>
                                <Link className="btn btn-primary btn-lg my-3" to="/wordlestats" style={{width:"60%"}}>Your Stats</Link>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Loginform;
