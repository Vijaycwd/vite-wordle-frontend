import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import Axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Logo from '../../../Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Cropper from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';


function UserProfile() {
    const [userData, setUserData] = useState({});
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState(null); // cropped blob
    const [previewUrl, setPreviewUrl] = useState('');
    const [rawImage, setRawImage] = useState(null); // original file preview
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const cropperRef = useRef(null);

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email;

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/user/get-user.php?useremail=${loginuserEmail}`);
                if (res.data) {
                    setUserData(res.data.user);
                    setFirstName(res.data.user.first_name || "");
                    setLastName(res.data.user.last_name || "");
                    setUsername(res.data.user.username || "");
                    setPreviewUrl(res.data.user.avatar || "");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        if (loginuserEmail) fetchUserData();
    }, [loginuserEmail]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRawImage(reader.result); // show in cropper
            };
            reader.readAsDataURL(file);
        }
    };

    const cropImage = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper && cropper.getCroppedCanvas()) {
            cropper.getCroppedCanvas().toBlob((blob) => {
                if (blob) {
                    setAvatar(blob);
                    setPreviewUrl(URL.createObjectURL(blob));
                    setRawImage(null); // hide cropper after cropping
                }
            });
        }
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
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);
            formData.append("username", username);
            if (password) formData.append("password", password);
            if (avatar) formData.append("avatar", avatar);

            const response = await Axios.post(
                "https://coralwebdesigns.com/college/wordgamle/user/edit-user.php",
                formData
            );

            if (response.data.status === "success") {
                toast.success("Profile updated successfully!", { position: "top-center" });
                localStorage.setItem("auth", JSON.stringify({ ...USER_AUTH_DATA, firstName, lastName, username, avatar: previewUrl }));
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
                <Row className="align-content-center justify-content-center">
                    <Col md={5}>
                        <Form onSubmit={updateUser}>
                            <Form.Group controlId="formFile" className="mb-3 text-center">
                                <label htmlFor="profilePicInput" style={{ cursor: 'pointer' }}>
                                    <img
                                        src={
                                            previewUrl?.startsWith("blob:")
                                                ? previewUrl
                                                : previewUrl
                                                    ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${previewUrl}`
                                                    : Logo
                                        }
                                        alt="Profile"
                                        className="rounded-circle mb-3"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                </label>
                                <Form.Control
                                    id="profilePicInput"
                                    type="file"
                                    onChange={handleUpload}
                                    style={{ display: 'none' }}
                                />
                            </Form.Group>

                            {rawImage && (
                                <>
                                    <Cropper
                                    src={rawImage}
                                    style={{ height: 400, width: "100%" }}
                                    aspectRatio={1}
                                    viewMode={1}
                                    guides={false}
                                    background={false}
                                    dragMode="move"
                                    scalable={true}
                                    zoomable={true}
                                    cropBoxResizable={false}
                                    cropBoxMovable={false}
                                    ref={cropperRef}
                                    />
                                    <div className="text-center mt-2">
                                        <Button variant="primary" onClick={cropImage}>Crop Image</Button>
                                    </div>
                                </>
                            )}

                            <div className='text-center'>
                                <h2>{username || "User"}</h2>
                                <h4>{firstName} {lastName}</h4>
                            </div>

                            <Form.Group className="mt-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mt-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mt-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mt-3">
                                <Form.Label>Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <InputGroup.Text>
                                        <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"} onClick={togglePasswordVisibility}></i>
                                    </InputGroup.Text>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mt-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={confirmpassword}
                                        onChange={(e) => setConfirmpassword(e.target.value)}
                                    />
                                    <InputGroup.Text>
                                        <i className={showConfirmPassword ? "fa fa-eye-slash" : "fa fa-eye"} onClick={toggleConfirmPasswordVisibility}></i>
                                    </InputGroup.Text>
                                </InputGroup>
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
