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
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate a default file (e.g., from an initial value or previous upload)
        const defaultFile = new File([""], "defaultAvatar.png", { type: "image/png" });
        // Set the default file to state
        setAvatar(defaultFile);
    }, []);

    const handleUpload = async (e) => {

        setAvatar(e.target.files[0]);
    }


    const signUp = async (e) => {
        
        const userObject = {
            username: username,
            email: email,
            password: password,
            confirmpassword: confirmpassword,
            avatar: avatar
        }
        console.log(userObject);
        const validation =(userObject) =>{
            const errors = {};

            if(!userObject.username){   
                errors.username = "Username Required";
            }
            if(!userObject.email){   
                errors.email = "Email Required";
            }
            if(!userObject.password){   
                errors.password = "Password Required";
            }
            if(!userObject.confirmpassword){   
                errors.confirmpassword = "Password Required";
            }
            return errors;
        }
        

        setErrors(validation(userObject));
        // console.log(userObject);
        
        

        const HEADERS = { headers: { 'Content-Type': 'multipart/form-data' } };
        try {
            const userRes = await Axios.post('https://wordle-server-gf3r.onrender.com/use/create-user', userObject, HEADERS);
            
            if (userRes.data.message) {
                toast.error('Error', { position: "top-center" });
            } else {
                toast.success('User Created!', { position: "top-center" });

                // Create the Wordle stats after the user is successfully created
                const TotalGameObject = {
                    username,
                    useremail: email,
                    totalWinGames: 0,
                    lastgameisWin: 0,
                    currentStreak: 0,
                };

                try {
                    const statsRes = await Axios.post('https://wordle-server-gf3r.onrender.com/wordle-game-stats/create-stats', TotalGameObject);
                    if (statsRes.data) {
                        console.log("Wordle stats created:", statsRes.data);
                    }
                } catch (err) {
                    console.error('Error creating Wordle stats:', err);
                    toast.error('Failed to create Wordle stats', { position: "top-center" });
                }

                navigate("/login");
            }
        } catch (err) {
            toast.error(err.response?.data || "Error occurred", { position: "top-center" });
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
                    <Form className="js-validation-signup">
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" className="" value={username} onChange={(e) => { setUsername(e.target.value);}} placeholder='Enter the name'/>
                            {errors.username && <p className='form-validation-error'>{errors.username}</p>}
                        </Form.Group>
                        
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email"  value={email} onChange={(e) => { setEmail(e.target.value);}} placeholder='Enter the email'/>
                            {errors.email && <p className='form-validation-error'>{errors.email}</p>}
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
                        <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4"  onClick={() => signUp()} ><i className="fa fa-fw fa-plus mr-1"></i> Sign Up</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>
  )
}

export default Registerform