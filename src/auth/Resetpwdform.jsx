import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Axios from 'axios';
import { useParams } from 'react-router-dom';
import {Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ResetPwdForm() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const [password, setPassword] = useState('');
    const { id, token } = useParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const resetPwd = async (e) => {
        e.preventDefault();
        
        // Prepare the user object to send in the body
        const userObject = {
            password: password,
            id: id,
            token: token,
        };
        
        try {
            const res = await Axios.post(`${baseURL}/auth/reset-password.php`, userObject);
            

            if (res.data.status === 'error') {
                toast.error(res.data.message);
            } else {
                toast.success('Password updated successfully');
                navigate('/login');
                
            }
        } catch (err) {
            
            toast.error('An error occurred. Please try again.');
        }

        // Clear password input
        setPassword('');
    };

    return (
        <>
           
            <div className="bg-image">
                <div className="row no-gutters justify-content-center bg-black-75">
                    <div className="hero-static col-md-6 d-flex align-items-center bg-white">
                        <div className="p-3 w-100">
                            <h4>Reset Password</h4>
                            <div className="row no-gutters justify-content-center">
                                <div className="col-sm-8 col-xl-6">
                                    <Form className="js-validation-signup" onSubmit={resetPwd}>
                                        <Form.Group controlId="password">
                                            <Form.Label>Password</Form.Label>
                                            <InputGroup>
                                                <Form.Control 
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control form-control-lg form-control-alt" 
                                                    value={password} 
                                                    onChange={(event) => setPassword(event.target.value)} 
                                                    placeholder="Enter your new password"
                                                    required
                                                />
                                                <InputGroup.Text style={{ cursor: 'pointer' }} onClick={togglePasswordVisibility}>
                                                    <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
                                                </InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>

                                        <Button type="submit" className="btn btn-block btn-hero-lg btn-hero-success mt-4">
                                            Update
                                        </Button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ResetPwdForm;
