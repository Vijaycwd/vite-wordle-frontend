import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import Axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Logo from '../../../Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FaPencilAlt, FaUpload } from 'react-icons/fa';
import ImageCropModal from './Modals/ImageCropModal';

function UserProfile() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const [userData, setUserData] = useState({});
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState(null); // cropped blob
    const [previewUrl, setPreviewUrl] = useState('');
    const [showCropModal, setShowCropModal] = useState(false);
    const [rawImage, setRawImage] = useState(null); // original file preview
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const cropperRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [isPaused, setIsPaused] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email;

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const [showManage, setShowManage] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await Axios.get(`${baseURL}/user/get-user.php?useremail=${loginuserEmail}`);
                if (res.data) {
                    setUserData(res.data.user);
                    setFirstName(res.data.user.first_name || "");
                    setLastName(res.data.user.last_name || "");
                    setUsername(res.data.user.username || "");
                    setPreviewUrl(res.data.user.avatar || "");
                    setIsPaused(res.data.user.is_paused === 1);
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
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        if (previewUrl && !previewUrl.startsWith("blob:")) {
            setRawImage(`${baseURL}/user/uploads/${previewUrl}`);
            setShowCropModal(true);
        }
    };

    const cropImage = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper && cropper.getCroppedCanvas()) {
            cropper.getCroppedCanvas().toBlob((blob) => {
                if (blob) {
                    setAvatar(blob);
                    setPreviewUrl(URL.createObjectURL(blob));
                    setRawImage(null);
                    setShowCropModal(false);
                }
            });
        }
    };

    const updateUser = async (e) => {
        e.preventDefault();
         
        if (password && password !== confirmpassword) {
            toast.error("Passwords do not match");
            return;
        }

        const newErrors = {};

        if (!firstName.trim()) newErrors.firstName = "First name is required";
        if (!lastName.trim()) newErrors.lastName = "Last name is required";
        if (!username.trim()) newErrors.username = "Username is required";
        if (password && password !== confirmpassword) {
            newErrors.confirmpassword = "Passwords do not match";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        
        try {
            const formData = new FormData();
            formData.append("id", userData.id);
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);
            formData.append("username", username);
            if (password) formData.append("password", password);
            if (avatar) formData.append("avatar", avatar);

            const response = await Axios.post(
                `${baseURL}/user/edit-user.php`,
                formData
            );

            if (response.data.status === "success") {
                toast.success("Profile updated successfully!");
                localStorage.setItem("auth", JSON.stringify({
                ...USER_AUTH_DATA,
                firstName,
                lastName,
                username,
                avatar: `${response.data.avatar || previewUrl}?t=${Date.now()}`
                }));
            } else {
                toast.error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

   const handlePauseToggle = async () => {
        try {
            const newPausedState = !isPaused;
            await Axios.post(`${baseURL}/user/pause-user.php`, {
                user_id: userData.id,
                is_paused: newPausedState ? 1 : 0,
            });
            setIsPaused(newPausedState);
            // toast.success(newPausedState ? "Paused Play" : "Unpaused Play");
        } catch (error) {
            toast.error("Failed to update pause state.");
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await Axios.post(`${baseURL}/user/delete-user.php`, { user_id: userData.id });
            localStorage.removeItem('auth');
            navigate('/');
        } catch (error) {
            toast.error("Failed to delete account.");
        }
    };

    return (
        <Container>
            <Row className="align-content-center justify-content-center">
                <Col md={5}>
                    <Form onSubmit={updateUser}>
                        <Form.Group className="mb-3 text-center">
                            <div className="profile-pic-wrapper">
                                <label className="profile-pic-label" onClick={handleAvatarClick}>
                                    <img
                                        src={
                                            previewUrl?.startsWith("blob:")
                                                ? previewUrl
                                                : previewUrl
                                                    ? `${baseURL}/user/uploads/${previewUrl}`
                                                    : Logo
                                        }
                                        alt="Profile"
                                        className="profile-pic-img"
                                    />
                                </label>
                                <label htmlFor="existingprofilePicInput" className="edit-icon-label" onClick={handleAvatarClick}>
                                    <FaPencilAlt size={18} color="#ffffff" />
                                </label>
                                 <label htmlFor="profilePicInput" className="upload-icon-label">
                                    <FaUpload  size={18} color="#ffffff" />
                                </label>
                                <input
                                    type="file"
                                    id="profilePicInput"
                                    className="profile-pic-input"
                                    onChange={handleUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </Form.Group>

                        <div className='text-center'>
                            <h2>{username || "User"}</h2>
                            <h4>{firstName} {lastName}</h4>
                        </div>

                        <Form.Group className="mt-3">
                            <Form.Label>First Name <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            {errors.firstName && <div style={{ color: "red" }}>{errors.firstName}</div>}
                        </Form.Group>

                        <Form.Group className="mt-3">
                            <Form.Label>Last Name <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            {errors.lastName && <div style={{ color: "red" }}>{errors.lastName}</div>} {/* ✅ Fix here */}
                        </Form.Group>

                        <Form.Group className="mt-3">
                            <Form.Label>Username <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                            {errors.username && <div style={{ color: "red" }}>{errors.username}</div>} {/* ✅ Fix here */}
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
                        <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4 float-right" onClick={() => setShowManage(true)}>
                            Manage Account
                        </Button>
                    </Form>
                </Col>
            </Row>

            <Modal show={showManage} onHide={() => setShowManage(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Manage Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='mb-4'>
                        <h6>Pause Play</h6>
                        <p className="small">
                         {isPaused ? "Account active, but not visible to other Gamlers - unable to be invited into groups and will not appear in Leaderboards." : " Keep my account active, but hide from group Invitations and Leaderboards."}
                         </p>
                        <Button 
                        variant={isPaused ? "success" : "warning"} 
                        className="w-100" 
                        onClick={handlePauseToggle}
                        >
                        {isPaused ? "Account Paused" : "Pause Account"}
                        </Button>
                    </div>      
                    <div>
                        <h6>Delete Account</h6>
                        <p className="small">Delete your account permanently. This cannot be undone.</p>
                        <Button
                        variant="danger"
                        className="w-100" 
                        onClick={() => {
                            setShowManage(false);         
                            setShowDeleteConfirm(true);   
                        }}
                        >
                        Delete Account
                        </Button>
                    </div>              
                    

                </Modal.Body>
            </Modal>
            <Modal
            show={showDeleteConfirm}
            onHide={() => {
                setShowDeleteConfirm(false);
                setShowManage(true);
            }}
            centered
            >
            <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button
                variant="secondary"
                onClick={() => {
                    setShowDeleteConfirm(false);
                    setShowManage(true);
                }}
                >
                Cancel
                </Button>

                <Button variant="danger" onClick={handleDeleteAccount}>
                Yes, Delete
                </Button>
            </Modal.Footer>
            </Modal>


            <ImageCropModal
                show={showCropModal}
                handleClose={() => setShowCropModal(false)}
                rawImage={rawImage}
                cropperRef={cropperRef}
                cropImage={cropImage}
            />
        </Container>
    );
}

export default UserProfile;
