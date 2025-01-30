import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GroupModal from '../constant/Models/GroupModal';

function Groups() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;

    const [groups, setGroups] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [groupname, setGroupname] = useState('');

    // Fetch groups from MySQL
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await Axios.get("https://coralwebdesigns.com/college/wordgamle/groups/get-groups.php");
                setGroups(res.data.groups || []);
            } catch (err) {
                toast.error("Failed to load groups.", { position: "top-center" });
            }
        };

        fetchGroups();
    }, []);

    const handleFormClose = () => {
        setShowForm(false);
        setGroupname('');
    };

    const handleShow = () => {
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
            toast.success(res.data.message, { position: "top-center" });
            setGroupname('');
            setGroups([...groups, { name: groupname }]); // Update UI instantly
        } catch (err) {
            toast.error(err.response?.data?.message || "An unexpected error occurred.", { position: "top-center" });
        }
    };

    return (
        <>
            <ToastContainer />
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} className="border p-3 shadow rounded text-center">
                        <h4>Groups</h4>
                        <div className="d-flex flex-wrap justify-content-around">
                            {groups.length > 0 ? (
                                    groups.map((group, index) => (  
                                        <>
                                        <div className="border p-3 border rounded d-flex" style={{ width: '30%',margin: "10px"}}>
                                            {group.name}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: '18px',height: "18px", marginLeft: '20px'}}><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/></svg>
                                        </div>  
                                        </>     
                                    ))
                                ) : (
                                    <p>No groups available.</p>
                                )}
                        </div>
                        <Button className="wordle-btn px-5 mt-3" onClick={handleShow}>
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

export default Groups;
