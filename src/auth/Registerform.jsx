import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import Axios from "axios";
import { toast } from 'react-toastify';
import logo from '../Logo.png';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

function Registerform() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email;
    const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
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
    const [registrationformText, setRegistrationFormText] = useState({
        firstname_label: '',
        firstname_desc: '',
        firstname_placeholder: '',
        lastname_label: '',
        lastname_desc: '',
        lastname_placeholder: '',
        username_label: '',
        username_desc: '',
        username_placeholder: '',
        email_label: '',
        email_desc: '',
        email_placeholder: '',
        phone_label: '',
        phone_desc: '',
        phone_placeholder: '',
        password_label: '',
        password_desc: '',
        password_placeholder: '',
        confirm_password_label: '',
        confirm_password_desc: '',
        confirm_password_placeholder: '',
        profile_picture_label: '',
        profile_picture_desc: '',
        profile_picture_placeholder: '',
        });

    
      useEffect(() => {
        Axios.get(`${baseURL}/user/get-homepage-text.php`)
          .then((res) => {
            if (res.status === 200) {
              setRegistrationFormText(res.data);
            } else {
              console.warn('No homepage text found');
            }
          })
          .catch((err) => {
            console.error('Error fetching homepage text:', err);
          });
      }, [baseURL]);
    
    useEffect(() => {
        const USER_AUTH_DATA = JSON.parse(localStorage.getItem("auth"));
        if (USER_AUTH_DATA?.email) {
        setAlreadyLoggedIn(true);

        // Optional: redirect after 3 seconds
        setTimeout(() => {
            navigate("/");
        }, 3000);
        }else {
        const defaultFile = new File([""], "default_avatar.png", { type: "image/png" });
        setAvatar(defaultFile);
        } 
    }, []);
    

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
        setLoading(true);
        const allTouched = {
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            phone: true,
            password: true,
            confirmpassword: true,
            avatar: true
        };
        setTouched(allTouched);

        if (!validateForm()) {
            setLoading(false); // Stop loading if validation fails
            return;
        }

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
                // ✅ Auto-login after registration
                try {
                    const loginRes = await Axios.post(`${baseURL}/auth/login.php`, {
                        email: email,
                        password: password
                    }); 
                    console.log(loginRes.data);
                    if (loginRes.data.status === 'success' && loginRes.data) {
                        localStorage.setItem('auth', JSON.stringify(loginRes.data));
                        navigate('/');
                    } else {
                        toast.error("Auto-login failed. Please log in manually.");
                        navigate('/login');
                    }

                } catch (loginErr) {
                    toast.error("Error logging in automatically.");
                    navigate('/login');
                }
            } else {
                toast.error(res.data.message || "Registration failed");
            }
        } catch (err) {
            toast.error("An error occurred during registration");
        }finally {
            setLoading(false); // Stop loading animation
        }
    };

    return (
        
        <Container>
            <Row className='align-content-center justify-content-center'>
                {alreadyLoggedIn ? (
                    <div className="alert alert-warning text-center">
                    You are already logged in. Redirecting...
                    </div>
                ) : (
                    <Col md={6}>
                        <img src={logo} alt="logo" className='d-block m-auto' />
                        <h5>Create New Account</h5>
                        <Form encType="multipart/form-data" onSubmit={signUp}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    {/* Label with HTML + required star */}
                                    <Form.Label
                                        dangerouslySetInnerHTML={{
                                        __html: `${registrationformText.firstname_label} <span style="color:red">*</span>`
                                        }}
                                    />

                                    {/* Description with HTML */}
                                    <div
                                        style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                        dangerouslySetInnerHTML={{
                                        __html: registrationformText.firstname_desc
                                        }}
                                    />

                                    {/* Input with placeholder (placeholders can't use dangerouslySetInnerHTML) */}
                                    <Form.Control
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setfirstName(e.target.value)}
                                        onBlur={() => handleBlur('firstName')}
                                        placeholder={registrationformText.firstname_placeholder}
                                    />

                                    {/* Error message */}
                                    {touched.firstName && errors.firstName && (
                                        <p className='form-validation-error'>{errors.firstName}</p>
                                    )}
                                    </Form.Group>

                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label
                                        dangerouslySetInnerHTML={{
                                        __html: `${registrationformText.lastname_label} <span style="color:red">*</span>`
                                        }}
                                    />
                                    <div
                                        style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                        dangerouslySetInnerHTML={{
                                        __html: registrationformText.lastname_desc
                                        }}
                                    />
                                    <Form.Control
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setlastName(e.target.value)}
                                        onBlur={() => handleBlur('lastName')}
                                        placeholder={registrationformText.lastname_placeholder}
                                    />
                                    {touched.lastName && errors.lastName && <p className='form-validation-error'>{errors.lastName}</p>}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label
                                        dangerouslySetInnerHTML={{
                                        __html: `${registrationformText.username_label} <span style="color:red">*</span>`
                                        }}
                                    />
                                     <div
                                        style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                        dangerouslySetInnerHTML={{
                                        __html: registrationformText.username_desc
                                        }}
                                    />
                                    <Form.Control
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onBlur={() => handleBlur('username')}
                                        placeholder={registrationformText.username_placeholder}
                                    />
                                    {touched.username && errors.username && <p className='form-validation-error'>{errors.username}</p>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label
                                        dangerouslySetInnerHTML={{
                                        __html: `${registrationformText.email_label} <span style="color:red">*</span>`
                                        }}
                                    />
                                     <div
                                        style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                        dangerouslySetInnerHTML={{
                                        __html: registrationformText.email_desc
                                        }}
                                    />
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => handleBlur('email')}
                                        placeholder={registrationformText.email_placeholder}
                                    />
                                    {touched.email && errors.email && <p className='form-validation-error'>{errors.email}</p>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label
                                        dangerouslySetInnerHTML={{
                                        __html: `${registrationformText.phone_label}`
                                        }}
                                    />
                                     <div
                                        style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                        dangerouslySetInnerHTML={{
                                        __html: registrationformText.phone_desc
                                        }}
                                    />
                                    
                                    <Form.Control
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                        if (value.length <= 10) {
                                        setPhone(value);
                                        }
                                    }}
                                    placeholder={registrationformText.phone_placeholder}
                                    maxLength={10}
                                    />

                                    {touched.phone && errors.phone && <p className='form-validation-error'>{errors.phone}</p>}
                                </Form.Group>
                                

                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label
                                        dangerouslySetInnerHTML={{
                                        __html: `${registrationformText.password_label} <span style="color:red">*</span>`
                                        }}
                                    />
                                     <div
                                        style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                        dangerouslySetInnerHTML={{
                                        __html: registrationformText.password_desc
                                        }}
                                    />
                                    
                                    <InputGroup>
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onBlur={() => handleBlur('password')}
                                            placeholder={registrationformText.password_placeholder}
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
                                    <Form.Label
                                        dangerouslySetInnerHTML={{
                                        __html: `${registrationformText.confirm_password_label} <span style="color:red">*</span>`
                                        }}
                                    />
                                     <div
                                        style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                        dangerouslySetInnerHTML={{
                                        __html: registrationformText.confirm_password_desc
                                        }}
                                    />
                                    <InputGroup>
                                        <Form.Control
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmpassword}
                                        onChange={(e) => setConfirmpassword(e.target.value)}
                                        onBlur={() => handleBlur('confirmpassword')}
                                        placeholder={registrationformText.confirm_password_placeholder}
                                        />
                                        <InputGroup.Text style={{ cursor: 'pointer' }} onClick={toggleConfirmPasswordVisibility}>
                                            <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
                                        </InputGroup.Text>
                                    </InputGroup>
                                    {touched.confirmpassword && errors.confirmpassword && <p className='form-validation-error'>{errors.confirmpassword}</p>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formFile" className="mb-3">
                                    <Form.Label
                                        dangerouslySetInnerHTML={{
                                        __html: `${registrationformText.profile_picture_label}`
                                        }}
                                    />
                                     <div
                                        style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                        dangerouslySetInnerHTML={{
                                        __html: registrationformText.profile_picture_desc
                                        }}
                                    />
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
                                <Form.Control
                                    type="hidden"
                                    name="groupId"
                                    value={groupId}
                                    disabled
                                />
                                </Form.Group>
                            </Col>
                            )}
                        </Row>

                        <Row>
                            
                        </Row>

                        <Button
                            className="btn btn-block btn-hero-lg btn-hero-success mt-4"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Signing Up...
                                </>
                            ) : (
                                <>
                                    <i className="fa fa-fw fa-plus mr-1"></i> Sign Up
                                </>
                            )}
                        </Button>

                    </Form>

                    </Col>
                )}
            </Row>
        </Container>
    );
}

export default Registerform;
