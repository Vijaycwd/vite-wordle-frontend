import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import AddMembers from '../constant/Models/AddMembers';
import { toast } from 'react-toastify';
import MemberGameSelections from './MemberGameSelections';
import SelectScoringMethod from './SelectScoringMethod';

function GroupPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
    const { id: userId } = USER_AUTH_DATA;

    const [group, setGroup] = useState(null);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [isCaptain, setIsCaptain] = useState(false);
    const [existingMembers, setExistingMembers] = useState([]); // NEW

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

        const fetchGroupMembers = async () => {
            try {
                const res = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-members.php?group_id=${id}`);
               
                if (res.data.status === "success") {
                   const memberIds = res.data.members.map(m => String(m.member_id));
                    setExistingMembers(memberIds);
                } else {
                    setExistingMembers([]);
                }
            } catch (err) {
                console.error("Failed to fetch group members");
                setExistingMembers([]);
            }
        };

        fetchGroupDetails();
        fetchGroupMembers();
    }, [id, userId]);

    const goToGroupInfo = () => {
        navigate(`/group-info/${id}`);
    };

    if (!group) return null;
    console.log('existingMembers',existingMembers)
    return (
        <Container className="text-center">
            <Row>
                <Col>
                    <h4>Group: {group.name}</h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button className="px-5 mt-3" onClick={goToGroupInfo}>
                        Group Info
                    </Button>
                </Col>
            </Row>
            {isCaptain && (
                <Row>
                    <Col>
                        <Button className="px-5 mt-3" onClick={() => setShowMemberForm(true)}>
                            Add Group Members
                        </Button>
                    </Col>
                </Row>
            )}
            <Button className="px-5 mt-3" onClick={() => navigate(`/group/${group.id}/${group.name.toLowerCase().replace(/\s+/g, '-')}/stats`)}>Group Leaderboards</Button>
            <MemberGameSelections />
            {isCaptain && <SelectScoringMethod />}
            <AddMembers
                showForm={showMemberForm}
                handleFormClose={() => setShowMemberForm(false)}
                groupName={group.name}
                groupId={group.id}
                existingMembers={existingMembers}
            />
        </Container>
    );
}

export default GroupPage;
