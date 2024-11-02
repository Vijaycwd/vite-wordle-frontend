import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../Logo.png'
import { useNavigate } from "react-router-dom";
function Registerform() {
    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [avatar, setAvatar] = useState();
    const [previewUrl, setPreviewUrl] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirmpassword: false,
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate a default file (e.g., from an initial value or previous upload)
        const defaultFile = new File([""], "defaultAvatar.png", { type: "image/png" });
        // Set the default file to state
        setAvatar(defaultFile);
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (touched.username && !username) newErrors.username = 'Name is required.';
        if (touched.email) {
            if (!email) {
                newErrors.email = 'Email is required.';
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                newErrors.email = 'Email is invalid.';
            }
        }
        if (touched.password) {
            if (!password) {
                newErrors.password = 'Password is required.';
            } else if (password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters long.';
            } else if (!/[a-zA-Z]/.test(password)) {
                newErrors.password = 'Password must contain at least one alphabetic letter.';
            }
        }
        if (touched.confirmpassword && password !== confirmpassword) {
            newErrors.confirmpassword = 'Passwords do not match.';
        }
        setErrors(newErrors);
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateForm();
    };
    const handleUpload = async (event) => {

        const file = event.target.files[0];
        setAvatar(file);
        const reader = new FileReader();
        reader.onloadend = () => {
        setPreviewUrl(reader.result); // Set the preview URL
        };

        if (file) {
        reader.readAsDataURL(file); // Convert file to base64 URL
        }
    }


    const signUp = async (event) => {
        event.preventDefault();
        const userObject = {
            username: username,
            email: email,
            password: password,
            confirmpassword: confirmpassword,
            avatar: avatar
        }
        console.log(userObject);

        // console.log(userObject);
        const HEADERS = { headers: { 'Content-Type': 'multipart/form-data' } };
        
        const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/user/create-user.php', userObject, HEADERS);
        if (res.data.status === 'success') {

            const WordleStatistics = {
                username,
                useremail: email,
                totalGamesPlayed:0,
                totalWinGames: 0,
                lastgameisWin: 0,
                currentStreak: 0,
                maxStreak: 0,
                guessDistribution: [0,0,0,0,0,0],
                handleHighlight: [0]
            };
            const wordleStats = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/wordle/create-statistics.php', WordleStatistics);
            console.log(wordleStats);
            const ConnectionStatistics = {
                username,
                useremail: email,
                totalGamesPlayed:0,
                totalWinGames: 0,
                lastgameisWin: 0,
                currentStreak: 0,
                maxStreak: 0,
                guessDistribution: [0,0,0,0,0,0],
                handleHighlight: [0]
            };
            const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/games/connections/create-statistics.php', ConnectionStatistics);
            toast.success(res.data.message, { position: "top-center" });
            navigate('/login');
            }
        else{
            toast.error(res.data.message, { position: "top-center" });
        }  
      }
  return (
    <>  
        <ToastContainer />
        <Container>
            <Row className='align-content-center justify-content-center'> 
                <Col md={4}>
                    <img src={logo} alt="logo" className='d-block m-auto'></img>
                    <h5>Create New Account</h5>
                    <Form className="js-validation-signup" enctype="multipart/form-data">
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); }}
                                onBlur={() => handleBlur('username')}
                                placeholder='Enter the name'
                            />
                            {errors.username && <p className='form-validation-error'>{errors.username}</p>}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); }}
                                onBlur={() => handleBlur('email')}
                                placeholder='Enter the email'
                            />
                            {errors.email && <p className='form-validation-error'>{errors.email}</p>}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); }}
                                onBlur={() => handleBlur('password')}
                                placeholder='Enter the password'
                            />
                            {errors.password && <p className='form-validation-error'>{errors.password}</p>}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmpassword}
                                onChange={(e) => { setConfirmpassword(e.target.value); }}
                                onBlur={() => handleBlur('confirmpassword')}
                                placeholder='Enter the confirm password'
                            />
                            {errors.confirmpassword && <p className='form-validation-error'>{errors.confirmpassword}</p>}
                        </Form.Group>

                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Profile Picture</Form.Label>
                            <Form.Control
                                type="file"
                                name="avatar"
                                onChange={handleUpload}
                            />
                        </Form.Group>

                        {previewUrl && (
                            <div>
                                <p>Image Preview:</p>
                                <img src={previewUrl} alt="Profile Preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                            </div>
                        )}

                        <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4" onClick={signUp}>
                            <i className="fa fa-fw fa-plus mr-1"></i> Sign Up
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>
  )
}

export default Registerform