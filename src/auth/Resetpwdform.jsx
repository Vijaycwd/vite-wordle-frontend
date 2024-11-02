import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Axios from 'axios';
import { useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';

function ResetPwdForm() {
    const [password, setPassword] = useState('');
    const { id, token } = useParams();
    const navigate = useNavigate();
    const resetPwd = async (e) => {
        e.preventDefault();
        
        // Prepare the user object to send in the body
        const userObject = {
            password: password,
            id: id,
            token: token,
        };
        
        try {
            const res = await Axios.post('https://coralwebdesigns.com/college/wordgamle/auth/reset-password.php', userObject);
            console.log(res.data);

            if (res.data.status === 'error') {
                toast.error(res.data.message, {
                    position: 'top-center'
                });
            } else {
                toast.success('Password updated successfully', {
                    position: 'top-center'
                });
                navigate('/login');
                
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred. Please try again.', {
                position: 'top-center'
            });
        }

        // Clear password input
        setPassword('');
    };

    return (
        <>
            <ToastContainer />
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
                                            <Form.Control 
                                                type="password" 
                                                className="form-control form-control-lg form-control-alt" 
                                                value={password} 
                                                onChange={(event) => setPassword(event.target.value)} 
                                                placeholder='Enter your new password' 
                                                required
                                            />
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
