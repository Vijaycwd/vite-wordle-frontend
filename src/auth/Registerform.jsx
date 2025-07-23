import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import Axios from "axios";
import { toast } from 'react-toastify';
import logo from '../Logo.png';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

function Registerform() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmpassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const encryptedId = params.get('group_id');
    const groupId = encryptedId ? atob(encryptedId) : null;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setConfirmShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setConfirmShowPassword(!showConfirmPassword);
    };

    useEffect(() => {
        const defaultFile = new File([""], "default_avatar.png", { type: "image/png" });
        setAvatar(defaultFile);
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!firstName.trim()) newErrors.firstName = 'First name is required.';
        if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
        if (!username.trim()) newErrors.username = 'Username is required.';

        if (!email) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid.';
        }

        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
        } else if (!/[a-zA-Z]/.test(password)) {
            newErrors.password = 'Password must contain at least one letter.';
        }

        if (!confirmpassword) {
            newErrors.confirmpassword = 'Confirm your password.';
        } else if (password !== confirmpassword) {
            newErrors.confirmpassword = 'Passwords do not match.';
        }

        if (avatar && avatar.name !== 'default_avatar.png') {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(avatar.type)) {
                newErrors.avatar = 'Invalid file type. Only JPEG, PNG, or WEBP allowed.';
            } else if (avatar.size > 100 * 1024) {
                newErrors.avatar = 'Profile picture must be less than 100KB.';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleUpload = (event) => {
        const file = event.target.files[0];
        setTouched(prev => ({ ...prev, avatar: true }));

        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'Invalid file type. Only JPEG, PNG, or WEBP allowed.',
                }));
                setAvatar(null);
                setPreviewUrl('');
                return;
            } else if (file.size > 100 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'Profile picture must be less than 100KB.',
                }));
                setAvatar(null);
                setPreviewUrl('');
                return;
            } else {
                // Valid file, clear avatar error
                setErrors(prev => ({ ...prev, avatar: '' }));
            }

            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const signUp = async (event) => {
        event.preventDefault();

        const allTouched = {
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            password: true,
            confirmpassword: true
        };
        setTouched(allTouched);

        if (!validateForm()) return;

        const createdAt = new Date().toISOString();
        const formData = new FormData();
        formData.append('firstname', firstName);
        formData.append('lastname', lastName);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirmpassword', confirmpassword);
        formData.append('avatar', avatar);
        formData.append('createdAt', createdAt);

        if (groupId) {
            formData.append('groupId', groupId);
        }
        try {
            const res = await Axios.post(`${baseURL}/user/create-user.php`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.status === 'success') {
                const statsPayload = {
                    username,
                    useremail: email,
                    totalGamesPlayed: 0,
                    totalWinGames: 0,
                    lastgameisWin: 0,
                    currentStreak: 0,
                    maxStreak: 0,
                    updatedDate: createdAt
                };

                await Axios.post(`${baseURL}/games/wordle/create-statistics.php`, {
                    ...statsPayload,
                    guessDistribution: [0, 0, 0, 0, 0, 0],
                    handleHighlight: [0]
                });

                await Axios.post(`${baseURL}/games/connections/create-statistics.php`, {
                    ...statsPayload,
                    guessDistribution: [0, 0, 0, 0, 0],
                    handleHighlight: 0
                });

                await Axios.post(`${baseURL}/games/phrazle/create-statistics.php`, {
                    ...statsPayload,
                    guessDistribution: [0, 0, 0, 0, 0, 0],
                    handleHighlight: [0]
                });
                navigate('/login');
            } else {
                toast.error(res.data.message || "Registration failed");
            }
        } catch (err) {
            toast.error("An error occurred during registration");
        }
    };

    return (
        <Container>
            <Row className='align-content-center justify-content-center'>
                <Col md={6}>
                    <img src={logo} alt="logo" className='d-block m-auto' />
                    <h5>Create New Account</h5>
                    <Form encType="multipart/form-data" onSubmit={signUp}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name <span style={{ color: 'red' }}>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setfirstName(e.target.value)}
                                    onBlur={() => handleBlur('firstName')}
                                    placeholder='Enter your first name'
                                />
                                {touched.firstName && errors.firstName && <p className='form-validation-error'>{errors.firstName}</p>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name <span style={{ color: 'red' }}>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setlastName(e.target.value)}
                                    onBlur={() => handleBlur('lastName')}
                                    placeholder='Enter your last name'
                                />
                                {touched.lastName && errors.lastName && <p className='form-validation-error'>{errors.lastName}</p>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username <span style={{ color: 'red' }}>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={() => handleBlur('username')}
                                    placeholder='Enter your username'
                                />
                                {touched.username && errors.username && <p className='form-validation-error'>{errors.username}</p>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email <span style={{ color: 'red' }}>*</span></Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder='Enter your email'
                                />
                                {touched.email && errors.email && <p className='form-validation-error'>{errors.email}</p>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Password <span style={{ color: 'red' }}>*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        placeholder='Enter your password'
                                    />
                                    <InputGroup.Text style={{ cursor: 'pointer' }} onClick={togglePasswordVisibility}>
                                        <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
                                    </InputGroup.Text>
                                </InputGroup>
                                
                                {touched.password && errors.password && <p className='form-validation-error'>{errors.password}</p>}
                            </Form.Group>

                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password <span style={{ color: 'red' }}>*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmpassword}
                                    onChange={(e) => setConfirmpassword(e.target.value)}
                                    onBlur={() => handleBlur('confirmpassword')}
                                    placeholder='Confirm your password'
                                    />
                                    <InputGroup.Text style={{ cursor: 'pointer' }} onClick={toggleConfirmPasswordVisibility}>
                                        <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
                                    </InputGroup.Text>
                                </InputGroup>
                                {touched.confirmpassword && errors.confirmpassword && <p className='form-validation-error'>{errors.confirmpassword}</p>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label>Profile Picture</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="avatar"
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={handleUpload}
                                />
                                {touched.avatar && errors.avatar && (
                                    <p className="form-validation-error">{errors.avatar}</p>
                                )}
                            </Form.Group>

                            {previewUrl && (
                                <div>
                                    <p>Image Preview:</p>
                                    <img src={previewUrl} alt="Profile Preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                </div>
                            )}
                        </Col>
                        {groupId && (
                        <Col md={6}>
                            <Form.Group className="mb-3">
                            <Form.Label>
                                Group ID <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="groupId"
                                value={groupId}
                                disabled
                            />
                            </Form.Group>
                        </Col>
                        )}
                    </Row>

                    <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4" type="submit">
                        <i className="fa fa-fw fa-plus mr-1"></i> Sign Up
                    </Button>
                </Form>

                </Col>
            </Row>
        </Container>
    );
}

export default Registerform;
