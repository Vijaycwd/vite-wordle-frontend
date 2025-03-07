import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import Logo from '../../../Logo.png';

function UserProfile() {
    const [userData, setUserData] = useState({});
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const navigate = useNavigate();

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;

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
        if (password !== confirmpassword) {
            toast.error("Passwords do not match", { position: "top-center" });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("id", userData.id);
            if (password) formData.append("password", password);
            if (avatar) formData.append("avatar", avatar);

            const response = await Axios.put(
                "https://coralwebdesigns.com/college/wordgamle/user/edit-user.php",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.status === "success") {
                toast.success("Profile updated successfully!", { position: "top-center" });
                navigate('/');
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
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control type="password" value={confirmpassword} onChange={(e) => setConfirmpassword(e.target.value)} placeholder="Confirm new password" />
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
