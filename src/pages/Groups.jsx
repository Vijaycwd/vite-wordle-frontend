import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GroupModal from '../constant/Models/GroupModal';


function Groups() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;

    const [showForm, setShowForm] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [groupname, setGroupname] = useState('');

    const handleFormClose = () => {
        setShowForm(false);
        setScore('');
    };

    const handleLoginPromptClose = () => {
        setShowLoginPrompt(false);
    };

    const handleShow = (event) => {
        if (!loginUsername || !loginUserEmail) {
            setShowLoginPrompt(true);
            return;
        }
        setShowForm(true);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setShowForm(false);
        try {
            const res = await Axios.post(
                "https://coralwebdesigns.com/college/wordgamle/groups/create-group.php",
                { name: groupname }
            );
            toast.success(res.data.message , { position: "top-center" });
            setGroupname('');
        } catch (err) {
            toast.error(
                err.response?.data?.message || "An unexpected error occurred.",
                { position: "top-center" }
            );
        }
    }
    

    return (
        <>
            <ToastContainer/>
            <Container>
                <Row>
                    
                </Row>
                <Row className='justify-content-center align-items-center'>
                    <Col md={6} className='border p-3 shadow rounded text-center'>
                    <Button className="wordle-btn px-5" onClick={handleShow}>
                        Create Group
                    </Button>
                    </Col>
                </Row>

            <GroupModal
                showForm={showForm}
                handleFormClose={handleFormClose}
                onSubmit={onSubmit}
                groupname={groupname}
                setGroupname={setGroupname}
                loginUsername={loginUsername}
            />
            </Container>
        </>
    );
}


export default Groups