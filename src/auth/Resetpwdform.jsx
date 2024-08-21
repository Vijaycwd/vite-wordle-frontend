import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Axios from "axios";
import { useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
function Resetpwdform() {
    const [password, setPassword] =useState();
    const {id, token} = useParams();
    const resetPwd = async (e) => {
        e.preventDefault()
        setPassword('');
        const userObject = {
            password: password
        }
        Axios.post(`https://wordle-server-nta6.onrender.com/use/reset-password/${id}/${token}`, userObject)
        .then( res =>{
            console.log(res.data);
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
    <ToastContainer />
    <div className="bg-image">
            <div className="row no-gutters justify-content-center bg-black-75">
        <div className="hero-static col-md-6 d-flex align-items-center bg-white">
            <div className="p-3 w-100">
            
                <div className="mb-3 text-center">
                    <a className="link-fx font-w700 font-size-h1" href="index.html">
                        <span className="text-dark">Dash</span><span className="text-primary">mix</span>
                    </a>
                </div>
                <h5 className="text-center text-uppercase font-w700 font-size-sm text-muted">Reset Password</h5> 
                <div className="row no-gutters justify-content-center">
                    <div className="col-sm-8 col-xl-6">
                    <Form  className="js-validation-signup">
                        <Form.Group controlId="EmpID">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" className="form-control form-control-lg form-control-alt" name="signup-password" value={password} onChange={(event) => { setPassword(event.target.value);}} placeholder='Enter the password'/>
                        </Form.Group>
                        <Button className="btn btn-block btn-hero-lg btn-hero-success mt-4"  onClick ={resetPwd} ><i className="fa fa-fw fa-plus mr-1"></i> Update </Button>
                    </Form>
                    </div>
                </div>
                
            </div>
        </div>
        </div>
        </div>
    </>
    
  )
}

export default Resetpwdform