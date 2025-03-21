import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import Logo from '../../../Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';

function UserProfile() {
    const [userData, setUserData] = useState({});
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/user/get-user.php?useremail=${loginuserEmail}`);
                if (res.data) {
                    console.log(res.data);
                    setUserData(res.data.user);
                    setName(res.data.user.name || "");
                    setUsername(res.data.user.username || "");
                    setPreviewUrl(res.data.user.avatar || "");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserData();
    }, [loginuserEmail]);

    const handleUpload = (event) => {
        const file = event.target.files[0];
        setAvatar(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        if (file) reader.readAsDataURL(file);
    };

    const updateUser = async (e) => {
        e.preventDefault();
        
        if (password && password !== confirmpassword) {
            toast.error("Passwords do not match", { position: "top-center" });
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append("id", userData.id);
            formData.append("name", name);
            formData.append("username", username);
            if (password) formData.append("password", password);
            if (avatar) formData.append("avatar", avatar);
    
            const response = await Axios.post(
                "https://coralwebdesigns.com/college/wordgamle/user/edit-user.php",
                formData,
            );
    
            if (response.data.status === "success") {
                toast.success("Profile updated successfully!", { position: "top-center" });
    
                // Update localStorage with new data
                localStorage.setItem(
                    "auth",
                    JSON.stringify({ ...USER_AUTH_DATA, name, username, avatar: previewUrl })
                );
    
                navigate('/');
            } else {
                toast.error(response.data.message || "Failed to update profile", { position: "top-center" });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile", { position: "top-center" });
        }
    };
    

    return (
        <>
            <Container>
                <ToastContainer />
                {/* User Info Section */}
                <Row className="align-content-center justify-content-center text-center">
                    <Col md={4}>
                        <img 
                            src={previewUrl ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${previewUrl}` : Logo} 
                            alt="Profile" 
                            className="rounded-circle mb-3" 
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                        />
                        <h2>{username || "User"}</h2>
                        <h4>{name}</h4>
                    </Col>
                </Row>

                {/* Update Form */}
                <Row className="align-content-center justify-content-center">
                    <Col md={4}>
                        <Form onSubmit={updateUser}>
                            <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Form.Group>
    
                            <Form.Group>
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                            <Form.Label>Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                    />
                                    <InputGroup.Text>
                                        <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"} onClick={togglePasswordVisibility}></i>
                                    </InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a password.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group>
                            <Form.Label>Confirm Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Password"
                                        onChange={(e) => setConfirmpassword(e.target.value)}
                                        value={confirmpassword}
                                    />
                                    <InputGroup.Text>
                                        <i className={showConfirmPassword ? "fa fa-eye-slash" : "fa fa-eye"} onClick={toggleConfirmPasswordVisibility}></i>
                                    </InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a password.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label>Upload Profile Picture</Form.Label>
                                <Form.Control type="file" onChange={handleUpload} />
                            </Form.Group>

                            <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4" type="submit">
                                Update Profile
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default UserProfile;
