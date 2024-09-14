import React from 'react'
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserProfile() {
  const location = useLocation();
  const { username, email, id, isEditing } = location.state || {};
  return (
    <div>
      <div>
        <h1>Edit Profile</h1>
        <p>Username: {username}</p>
        <p>Email: {email}</p>
        <p>ID: {id}</p>
        <p>Is Editing: {isEditing ? "Yes" : "No"}</p>
        {/* Add your form and logic for updating the profile here */}
      </div>
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
    </div>
  )
}

export default UserProfile
