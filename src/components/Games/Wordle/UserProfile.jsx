import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../../../Logo.png';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

function UserProfile() {
    const USER_AUTH_DATA = JSON.parse(sessionStorage.getItem('auth'));
    const location = useLocation();
    const [username, setUsername] = useState(location.state?.username || "");
    const [email, setEmail] = useState(location.state?.email || "");
    const id = location.state?.id;
    const [password, setPassword] = useState(null);
    const [confirmpassword, setConfirmpassword] = useState(null);
    const [avatar, setAvatar] = useState();
    const [previewUrl, setPreviewUrl] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate a default file (e.g., from an initial value or previous upload)
        const defaultFile = new File([""], "defaultAvatar.png", { type: "image/png" });
        // Set the default file to state
        setAvatar(defaultFile);
    }, []);

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

    const validation = (userObject) => {
        const errors = {};
    
        if (!userObject.username) {   
            errors.username = "Username Required";
        }
        if (!userObject.email) {   
            errors.email = "Email Required";
        }
        // Add more validations for password if needed
        return errors;
    };

    const updateUser = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior if needed

        const userObject = {
            id: id,
            username: username,
            email: email,
            avatar: avatar
        };
        console.log(userObject);
        // Perform validation
        const validationErrors = validation(userObject);
        setErrors(validationErrors);

        const HEADERS = { headers: { 'Content-Type': 'multipart/form-data' } };
        const response = await Axios.put(`https://coralwebdesigns.com/college/wordgamle/user/edit-user.php`, userObject, HEADERS);
        if (response) {
            // Update the localStorage with the new user data
            const updatedAuthData = { ...USER_AUTH_DATA, username: username, email: email, avatar: avatar };
            localStorage.setItem('auth', JSON.stringify(updatedAuthData));
            //console.log('User updated successfully');
            toast.success('Profile updated successfully!', {
                position: "top-center"
            });
            // Optionally, navigate the user to another page
            navigate('/wordle');
        }
        // if (Object.keys(validationErrors).length === 0) {
        //     // No validation errors, proceed with the update
        //     try {
        //         const response = await Axios.put(`https://coralwebdesigns.com/college/wordgamle/user/edit-user.php${id}`, userObject, HEADERS);
        //         if (response) {
        //             // Update the localStorage with the new user data
        //             const updatedAuthData = { ...USER_AUTH_DATA, username: username, email: email, avatar: avatar };
        //             localStorage.setItem('auth', JSON.stringify(updatedAuthData));
        //             //console.log('User updated successfully');
        //             toast.success('Profile updated successfully!', {
        //                 position: "top-center"
        //             });
        //             // Optionally, navigate the user to another page
        //             navigate('/wordle');
        //         }
        //     } catch (err) {
        //         //console.error('Error updating user:', err.response.data.message);
        //         toast.error(err.response.data.message, {
        //             position: "top-center"
        //         });
        //     }
        // } else {
        //     // There are validation errors
        //     //console.log('Validation errors:', validationErrors);
        //     toast.error(validationErrors);
        // }
    };
    
    
  return (
    <>  
        
        <Container>
            <ToastContainer />
            <Row className='align-content-center justify-content-center'> 
                <Col md={4}>
                    <img src={Logo} alt="logo" className='d-block m-auto'></img>
                    <h5>Profile</h5>
                    <Form className="js-validation-signup">
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" className="" value={username} onChange={(e) => { setUsername(e.target.value);}} placeholder='Enter the name'/>
                            {errors.username && <p className='form-validation-error'>{errors.username}</p>}
                        </Form.Group>
                        <Form.Group >
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" className="" value={password} onChange={(e) => { setPassword(e.target.value);}} placeholder='Enter the password'/>
                            {errors.password && <p className='form-validation-error'>{errors.password}</p>}
                        </Form.Group>
                        <Form.Group >
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" className="" value={confirmpassword} onChange={(e) => { setConfirmpassword(e.target.value);}} placeholder='Enter the conform password'/>
                            {errors.confirmpassword && <p className='form-validation-error'>{errors.confirmpassword}</p>}
                        </Form.Group>
                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Profile Picture</Form.Label>
                            <Form.Control type="file" name="avatar" onChange={handleUpload}  />
                        </Form.Group>
                        {previewUrl && (
                            <div>
                            <p>Image Preview:</p>
                            <img src={previewUrl} alt="Profile Preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                            </div>
                        )}
                        <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4"  onClick={(e) => updateUser(e)} ><i className="fa fa-fw fa-plus mr-1"></i> Update</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>
  )
}

export default UserProfile