import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import AddMembers from '../constant/Models/AddMembers';
import { ToastContainer, toast } from 'react-toastify';
import MemberGameButtons from './MemberGameButtons';

function GroupPage() {
    const { id } = useParams();
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { id: userId } = USER_AUTH_DATA;

    const [group, setGroup] = useState(null);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [isCaptain, setIsCaptain] = useState(false);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const res = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-groups.php?id=${id}`);
                if (res.data.status === "success" && res.data.groups.length > 0) {
                    const fetchedGroup = res.data.groups[0];
                    setGroup(fetchedGroup);
                    setIsCaptain(fetchedGroup.captain_id === userId);
                } else {
                    setGroup(null);
                    toast.error("Group not found.");
                }
            } catch (err) {
                setGroup(null);
                toast.error("Failed to load group details.");
            }
        };

        fetchGroupDetails();
    }, [id, userId]);

    if (!group) return null;

    return (
        <Container className="text-center">
            <ToastContainer />
            <Row>
                <Col>
                    <h4>Group: {group.name}</h4>
                    <p>Group ID: {group.id}</p>
                </Col>
            </Row>

            {isCaptain ? (
                <Button className="wordle-btn px-5 mt-3" onClick={() => setShowMemberForm(true)}>
                    Add Group Members
                </Button>
            ) : (
                <MemberGameButtons/>
            )}


            <AddMembers
                showForm={showMemberForm}
                handleFormClose={() => setShowMemberForm(false)}
                groupName={group.name}
                groupId={group.id}
            />
        </Container>
    );
}

export default GroupPage;
