import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import AddMembers from '../constant/Models/AddMembers';
import { ToastContainer, toast } from 'react-toastify';

function GroupPage() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMemberForm, setShowMemberForm] = useState(false);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const res = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-groups.php?id=${id}`);
                if (res.data.status === "success" && res.data.groups.length > 0) {
                    setGroup(res.data.groups[0]);
                } else {
                    toast.error("Group not found.");
                }
            } catch (err) {
                toast.error("Failed to load group details.");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [id]);

    const handleMemberFormClose = () => setShowMemberForm(false);
    const handleShowMemberForm = () => setShowMemberForm(true);

    if (loading) return <p>Loading group details...</p>;
    if (!group) return <p>Group not found.</p>;

    return (
        <Container className="text-center">
            <ToastContainer />
            <Row>
                <Col>
                    <h4>Group: {group.name}</h4>
                    <p>Group ID: {group.id}</p>
                </Col>
            </Row>
            <Button className="wordle-btn px-5 mt-3" onClick={handleShowMemberForm}>
                Add Group Members
            </Button>

            {/* Add Members Modal */}
            <AddMembers
                showForm={showMemberForm}
                handleFormClose={handleMemberFormClose}
                groupName={group.name}
            />
        </Container>
    );
}

export default GroupPage;
