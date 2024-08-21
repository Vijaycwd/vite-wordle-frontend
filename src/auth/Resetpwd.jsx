import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Axios from "axios";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Resetpwd() {
    const [email, setEmail] =useState();
    const resetPwd = async (e) => {
        e.preventDefault()
        setEmail('');
        const userObject = {
            email: email
        }
        Axios.post('http://localhost:5001/use/reset-password', userObject)
        .then( res =>{
            if(res.data === 'Email Not Exist'){
                toast.error("Email Not Exist !", {
                    position: toast.POSITION.TOP_CENTER
                });
            }
            else{
                toast.success("Login Successfully", {
                    position: toast.POSITION.TOP_CENTER
                });
                console.log(res.data);
            }
        })
        .catch((err) => {
            console.log(err);
            toast.error("Invalid User Details", {
                position: toast.POSITION.TOP_CENTER
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
                
                    <div className="mb-3 text-center">
                        <a className="link-fx font-w700 font-size-h1" href="index.html">
                            <span className="text-dark">Dash</span><span className="text-primary">mix</span>
                        </a>
                    </div>
                    <h2 className="text-center text-uppercase font-w700 font-size-lg text-muted">Forgot Password</h2> 
                    <div className="row no-gutters justify-content-center">
                        <div className="col-sm-8 col-xl-12">
                                    <form className="js-validation-signin" >
                                        <div className="py-3">
                                            <div className="form-group">
                                                <input type="email" className="form-control form-control-lg form-control-alt"value={email} onChange={(e) => { setEmail(e.target.value);}} id="login-email" name="email" placeholder="Enter the email" />
                                            </div>
                                            
                                        </div>
                                        <div className="form-group">
                                        <button onClick ={resetPwd} type="submit"  className="btn btn-block btn-hero-lg btn-hero-primary">
                                                                <i className="fa fa-fw fa-sign-in-alt mr-1"></i> Send
                                                            </button>
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