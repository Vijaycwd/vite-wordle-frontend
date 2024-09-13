import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

function Loginform() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userAuthData = USER_AUTH_DATA;
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            setValidated(true);
        } else {
            setEmail('');
            setPassword('');
            const userObject = { email, password };
            Axios.post('https://wordle-server-nta6.onrender.com/use/login', userObject)
                .then(res => {
                    localStorage.setItem('auth', JSON.stringify(res.data));
                    navigate("/wordle");
                    if (res.data === 'Email Not Exist') {
                        toast.error("Email Not Exist !", { position: "top-center" });
                    } else {
                        toast.success("Login Successfully", { position: "top-center" });
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
                        <p className='fs-4 text-center'>Welcome to <b>WordGAMLE!</b></p>
                        <p className='text-center'>For now, we’re just playing Wordle and storing results.</p>
                        <p className='text-center'>Please create your profile and then click the Wordle button and go from there!</p>
                        {!userAuthData || isEmptyObject ? (
                            <>
                                <h4 className='mt-5'>Sign In</h4>
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
                                                    <InputGroup.Text onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                    </InputGroup.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter a password.
                                                    </Form.Control.Feedback>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Button type="submit">
                                        <i className="fa fa-fw fa-sign-in-alt mr-1"></i>Sign In
                                    </Button>
                                </Form>
                                <div className='btn-section my-3'>
                                    <Link className="btn btn-sm btn-light d-block d-lg-inline-block mb-1 float-left" to="/register">New Account</Link>
                                    <Link className="btn btn-sm btn-light d-block d-lg-inline-block mb-1 float-right" to="/reset-password">
                                        <i className="fa fa-exclamation-triangle text-muted mr-1"></i> Forgot password
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <Link className="btn btn-primary btn-lg mt-3" to="/wordle">Wordle</Link>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Loginform;
