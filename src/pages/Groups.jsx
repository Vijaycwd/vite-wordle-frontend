import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import GroupModal from '../constant/Models/GroupModal';

function Groups() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { id: userId, username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;

    const [groups, setGroups] = useState([]); // Groups created by the user
    const [memberGroups, setMemberGroups] = useState([]); // Groups where the user is a member
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [groupname, setGroupname] = useState('');
    const [selectedGames, setSelectedGames] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {


            try {
                // Fetch groups created by the user
                const resCreated = await Axios.post(
                    `${baseURL}/groups/get-groups.php`,
                    { user_id: userId }
                );
                setGroups(resCreated.data.groups || []);

                // Fetch groups where user is a member
                const resMember = await Axios.post(
                    `${baseURL}/groups/get-groups.php`,
                    { member_id: userId } // New API for groups where user is a member
                );
                setMemberGroups(resMember.data.groups || []);
            } catch (err) {
                toast.error("Failed to load groups.");
            }
        };

        fetchGroups();
    }, [userId]);

    const handleCreateFormClose = () => {
        setShowCreateForm(false);
        setGroupname('');
    };

    const handleShowCreateForm = () => {
        if (!loginUsername || !loginUserEmail) {
            toast.error("Please log in to create a group.");
            return;
        }
        setShowCreateForm(true);
    };

    const onSubmitCreateGroup = async (event) => {
        event.preventDefault();
        handleCreateFormClose();

        try {
            const res = await Axios.post(
                `${baseURL}/groups/create-group.php`,
                { name: groupname, captain_id: userId, games: selectedGames }
            );

            // toast.success(res.data.message);
            setGroups([...groups, { id: res.data.group_id, name: groupname, games: selectedGames.join(", ") }]);
        } catch (err) {
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
        }
    };

    return (
        <>
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} className="border p-3 shadow rounded text-center">
                        <h4>Groups Created By Me</h4>
                        <div className="row justify-content-center py-3">
                            {groups.length > 0 ? (
                                groups.map((group, index) => (
                                <div key={index} className="col-6 col-sm-4 col-md-3 mb-3 d-flex justify-content-center">
                                    <Button
                                    variant="outline-primary"
                                    className="w-100 text-wrap"
                                    onClick={() =>
                                        navigate(
                                        `/group/${group.id}/${group.name
                                            .toLowerCase()
                                            .replace(/\//g, '')
                                            .replace(/\s+/g, '-')
                                            .replace(/[^a-z0-9-]/g, '')}`
                                        )
                                    }
                                    >
                                    {group.name}
                                    </Button>
                                </div>
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

                {/* Groups where the user is a member */}
                <Row className="justify-content-center pt-4">
                    <Col md={6} className="border p-3 shadow rounded text-center">
                        <h4>Member in Groups</h4>
                        <div className="row justify-content-center py-3">
                            {memberGroups.length > 0 ? (
                                memberGroups.map((group, index) => (
                                <div key={index} className="col-6 col-sm-4 col-md-3 mb-3 d-flex justify-content-center">
                                    <Button
                                    variant="outline-success"
                                    className="w-100 text-wrap"
                                    onClick={() =>
                                        navigate(
                                        `/group/${group.id}/me-${group.name
                                            .toLowerCase()
                                            .replace(/\//g, '')
                                            .replace(/\s+/g, '-')
                                            .replace(/[^a-z0-9-]/g, '')}`
                                        )
                                    }
                                    >
                                    {group.name}
                                    </Button>
                                </div>
                                ))
                            ) : (
                                <p>No groups available.</p>
                            )}
                        </div>

                    </Col>
                </Row>

                {/* Group Creation Modal */}
                {/* <GroupModal
                    showForm={showCreateForm}
                    handleFormClose={handleCreateFormClose}
                    onSubmit={onSubmitCreateGroup}
                    groupname={groupname}
                    setGroupname={setGroupname}
                    selectedGames={selectedGames}
                    setSelectedGames={setSelectedGames}
                    loginUsername={loginUsername}
                /> */}
                <GroupModal 
                    showForm={showCreateForm} 
                    handleFormClose={handleCreateFormClose} 
                    groupname={groupname} 
                    setGroupname={setGroupname} 
                    selectedGames={selectedGames} 
                    setSelectedGames={setSelectedGames} 
                    loginUsername={loginUsername} 
                    editMode={false} // This tells the modal to show "Create"
                    onSubmit={onSubmitCreateGroup} 
                />
            </Container>
        </>
    );
}

export default Groups;
