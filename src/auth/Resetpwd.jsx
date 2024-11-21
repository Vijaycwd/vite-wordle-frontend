import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Axios from "axios";
import {Container, Row, Col, Button} from 'react-bootstrap';

function Resetpwd() {
    const [email, setEmail] =useState();

    const resetPwd = async (e) => {
        e.preventDefault()
        setEmail('');
        Axios.post('https://coralwebdesigns.com/college/wordgamle/auth/reset-password.php', {
            useremail: email
        })        
        .then( res =>{
            if(res.data === 'Email Not Exist'){
                toast.error("Email Not Exist !", {
                    position: "top-center"
                });
            }
            else{
                toast.success(res.data.message, {
                    position: "top-center"
                });
                console.log(res.data);
            }
        })
        .catch((err) => {
            console.log(err);
            toast.error("Invalid User Details", {
                position: "top-center"
            });
        })
    }
    return (
        <>
            <ToastContainer/>
            <Container>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                <div className="hero-static col-md-12 d-flex align-items-center bg-white">
                <div className="p-3 w-100">
                    <h4>Forgot Password</h4> 
                    <div className="row no-gutters justify-content-center">
                        <div className="col-sm-8 col-xl-12">
                                    <form className="js-validation-signin" >
                                        <div className="py-3">
                                            <div className="form-group">
                                                <input type="email" className="form-control form-control-lg form-control-alt"value={email} onChange={(e) => { setEmail(e.target.value);}} id="login-email" name="email" placeholder="Enter the email" />
                                            </div>
                                            
                                        </div>
                                        <div className="form-group">
                                        <Button onClick ={resetPwd} type="submit"  className="btn btn-block wordle-btn">
                                                                <i className="fa fa-fw fa-sign-in-alt mr-1"></i> Send
                                                            </Button>
                                        </div>
                                    </form>
                        </div>
                    </div>
                </div>
            </div>
                </Col>
            </Row>
                </Container>
        </>
    )
}

export default Resetpwd