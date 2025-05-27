import React, { useState } from 'react'
import { toast } from 'react-toastify';
import Axios from "axios";
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';

function Resetpwd() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const frontendURL = window.location.origin;

    const resetPwd = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await Axios.post(`${baseURL}/auth/reset-password.php`, {
                frontendURL, useremail: email
            });

            if (res.data.status === 'success') {
                setSuccess(true); // show the success alert
                setEmail(''); // clear field
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Invalid User Details", {
                position: "top-center"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    <div className="hero-static col-md-12 d-flex align-items-center bg-white">
                        <div className="p-3 w-100">
                            <h4>Forgot Password</h4>
                            <div className="row no-gutters justify-content-center">
                                <div className="col-sm-8 col-xl-12 my-4">
                                    {success ? (
                                        <Alert variant="success">
                                            ✅ Reset link has been sent to your email!
                                        </Alert>
                                    ) : (
                                        <form onSubmit={resetPwd}>
                                            <div className="py-3">
                                                <div className="form-group">
                                                    <input
                                                        type="email"
                                                        className="form-control form-control-lg form-control-alt"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        id="login-email"
                                                        name="email"
                                                        placeholder="Enter the email"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <Button
                                                    type="submit"
                                                    className="btn btn-block wordle-btn"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Spinner
                                                                as="span"
                                                                animation="border"
                                                                size="sm"
                                                                role="status"
                                                                aria-hidden="true"
                                                            /> Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa fa-fw fa-sign-in-alt mr-1"></i> Send
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Resetpwd;
