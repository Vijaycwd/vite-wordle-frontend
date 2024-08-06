import React, { useState } from 'react';
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
            return errors;
        }
        

        setErrors(validation(userObject));
        // console.log(userObject);
        
        

        const HEADERS = {
            headers : {
                'Content-Type': 'multipart/form-data',
            },
        } 
        Axios.post('http://localhost:5001/use/create-user', userObject, HEADERS)
        .then( res =>{
            if(res.data.message){
                toast.error('Error', {
                    position: "top-center"
                });
            }
            else{
                toast.success('User Created !', {
                    position: "top-center"
                });
                navigate("/login");
            }
        })
        .catch((err) => {
            // console.log(err.response.data);
            toast.error(err.response.data, {
                position: "top-center"
            });
        })       
      }
  return (
    <>  
        <ToastContainer />
        <Container>
            <Row className='align-content-center justify-content-center'>
                
                <Col md={4}>
                    <img src={logo} alt="logo" style={{width:"150px"}} className='d-block m-auto'></img>
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