import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import Axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Logo from '../../../Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Cropper from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';
import { FaPencilAlt } from 'react-icons/fa';
import ImageCropModal from './Modals/ImageCropModal';

function UserProfile() {
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

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email;

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const [showManage, setShowManage] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
                setShowCropModal(true);
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
                    setShowCropModal(false);
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

    const handlePausePlay = async () => {
        try {
            await Axios.post('https://coralwebdesigns.com/college/wordgamle/user/pause-user.php', { user_id: userData.id, is_paused: 1,});
            toast.success("Your account has been paused. Others can't invite you to groups.", { position: "top-center" });
        } catch (error) {
            toast.error("Failed to pause account.", { position: "top-center" });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await Axios.post('https://coralwebdesigns.com/college/wordgamle/user/delete-user.php', { user_id: userData.id });
            toast.success("Your account has been deleted.", { position: "top-center" });
            localStorage.removeItem('auth');
            navigate('/');
        } catch (error) {
            toast.error("Failed to delete account.", { position: "top-center" });
        }
    };


    return (
        <>
            <Container>
                <Row className="align-content-center justify-content-center">
                    <Col md={5}>
                        <Form onSubmit={updateUser}>
                            <Form.Group className="mb-3 text-center">
                               <div className="profile-pic-wrapper">
                                <label htmlFor="profilePicInput" className="profile-pic-label">
                                    <img
                                    src={
                                        previewUrl?.startsWith("blob:")
                                        ? previewUrl
                                        : previewUrl
                                            ? `https://coralwebdesigns.com/college/wordgamle/user/uploads/${previewUrl}`
                                            : Logo
                                    }
                                    alt="Profile"
                                    className="profile-pic-img"
                                    />
                                </label>

                                <label htmlFor="profilePicInput" className="edit-icon-label">
                                    <FaPencilAlt size={18} color="#ffffff" />
                                </label>

                                <input
                                    type="file"
                                    id="profilePicInput"
                                    className="profile-pic-input"
                                    onChange={handleUpload}
                                />
                                </div>
                                <Form.Control
                                    id="profilePicInput"
                                    type="file"
                                    onChange={handleUpload}
                                    style={{ display: 'none' }}
                                />

                            </Form.Group>
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
                            <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4 float-right" onClick={() => setShowManage(true)}>Manage Account</Button>
                        </Form>
                    </Col>
                </Row>
                <Modal show={showManage} onHide={() => setShowManage(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Manage Account</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Pause Play</strong></p>
                        <p className="small">
                        Keep my account and ability to enter and track my game results, but no other users will be able to see my name to invite me into a group.
                        </p>
                        <Button variant="warning" className="mb-3 w-100" onClick={handlePausePlay}>
                        Pause Play
                        </Button>

                        <p><strong>Delete Account</strong></p>
                        <p className="small">
                        Remove my account from WordGAMLE entirely. If I decide to re-join in the future, I understand that my history will start fresh at that time.
                        </p>
                        <Button variant="danger" className="w-100" onClick={handleDeleteAccount}>
                        Delete Account
                        </Button>
                    </Modal.Body>
                    </Modal>
                    <ImageCropModal
                        show={showCropModal}
                        handleClose={() => setShowCropModal(false)}
                        rawImage={rawImage}
                        cropperRef={cropperRef}
                        cropImage={cropImage}
                    />
        

            </Container>
        </>
    );
}

export default UserProfile;
