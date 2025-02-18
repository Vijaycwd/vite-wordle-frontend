import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'react-toastify/dist/ReactToastify.css';
import GroupModal from '../constant/Models/GroupModal';
import AddMembers from '../constant/Models/AddMembers';

function Groups() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;

    const [groups, setGroups] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false); // For GroupModal
    const [showMemberForm, setShowMemberForm] = useState(false); // For AddMembers
    const [groupname, setGroupname] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

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

    const handleCreateFormClose = () => {
        setShowCreateForm(false);
        setGroupname('');
    };

    const handleMemberFormClose = () => {
        setShowMemberForm(false);
    };

    const handleShowCreateForm = () => {
        if (!loginUsername || !loginUserEmail) {
            toast.error("Please log in to create a group.", { position: "top-center" });
            return;
        }
        setShowCreateForm(true);
    };

    const handleShowMemberForm = () => {
        if (!loginUsername || !loginUserEmail) {
            toast.error("Please log in to add members.", { position: "top-center" });
            return;
        }
        setShowMemberForm(true);
    };

    const onSubmitCreateGroup = async (event) => {
        event.preventDefault();
        handleCreateFormClose();
        try {
            const res = await Axios.post(
                "https://coralwebdesigns.com/college/wordgamle/groups/create-group.php",
                { name: groupname }
            );
            toast.success(res.data.message, { position: "top-center" });
            setGroups([...groups, { name: groupname }]);
        } catch (err) {
            toast.error(err.response?.data?.message || "An unexpected error occurred.", { position: "top-center" });
        }
    };

    const formatString = (str) => {
        return str.toLowerCase().replace(/\s+/g, '-');
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
                                    <Button 
                                        variant="outline-primary" 
                                        style={{ width: '30%', margin: "10px" }} 
                                        key={index}
                                        onClick={() => navigate(`/group/${group.id}/${formatString(group.name)}`)} // Navigate to group page
                                    >
                                        {group.name}
                                    </Button>
                                ))
                            ) : (
                                <p>No groups available.</p>
                            )}
                        </div>
                        <Row>
                            <Col>
                                <Button className="wordle-btn px-5 mt-3" onClick={handleShowCreateForm}>
                                    Create Group
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Group Creation Modal */}
                <GroupModal
                    showForm={showCreateForm}
                    handleFormClose={handleCreateFormClose}
                    onSubmit={onSubmitCreateGroup}
                    groupname={groupname}
                    setGroupname={setGroupname}
                    loginUsername={loginUsername}
                />

               
            </Container>
        </>
    );
}

export default Groups;
