import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import GroupModal from '../constant/Models/GroupModal';

function GroupInfo() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [captainid, setCaptainId] = useState(null);
    const [members, setMembers] = useState([]);
    const [scoringMethod, setScoringMethod] = useState([]);
    const [showModal, setShowModal] = useState(false);  // Modal state
    const [groupname, setGroupname] = useState('');
    const [loading, setLoading] = useState(false);

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;

    useEffect(() => {
        fetchGroupInfo();
    }, [id]);

    const fetchGroupInfo = async () => {
        try {
            const res = await Axios.get(`${baseURL}/groups/get-group-members.php?group_id=${id}`);
            
            if (res.data.status === "success") {
                setGroup(res.data.group);
                setCaptainId(res.data.captain_id);
                setMembers(res.data.members);
            } else {
                toast.error("Group not found.");
            }
        } catch (err) {
            toast.error("Failed to load group info.");
        }
    };

    useEffect(() => {
        const fetchScoringMethod = async () => {
            try {
                const res = await Axios.get(`${baseURL}/groups/get-scoring-method.php`, {
                    params: { user_id: userId, group_id: id }
                });

                if (res.data.status === "success") {
                    setScoringMethod(res.data.scoring_method || "");
                } else {
                    toast.error("Scoring Method not found.");
                }
            } catch (err) {
                toast.error("Failed to load scoring method.");
            }
        };

        if (id && userId) {  
            fetchScoringMethod();
        }
    }, [id, userId]); 

    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;

        try {
            const res = await Axios.post(`${baseURL}/groups/delete-group.php`, { group_id: id });
            if (res.data.status === "success") {
                toast.success(res.data.message);
                navigate('/groups');
            } else {
                toast.error("Failed to delete group.");
            }
        } catch (err) {
            toast.error("Error deleting group.");
        }
    };

    const handleUpdateGroup = async (event) => {
        event.preventDefault();
        setLoading(true);
    
        const localDate = new Date();
        const offsetMinutes = localDate.getTimezoneOffset();
        const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); 
        const created_at = adjustedDate.toISOString().slice(0, 19); // Correct format for MySQL DATETIME
    
        try {
            const res = await Axios.post(`${baseURL}/groups/update-group.php`, { 
                group_id: id,
                captainid,
                groupname,
                created_at // Ensure the key matches the backend field
            });
    
            if (res.data.status === "success") {
                toast.success(res.data.message);
                setShowModal(false);
    
                // Update group name in state without reloading
                setGroup((prevGroup) => ({
                    ...prevGroup,
                    name: groupname
                }));
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(res.data.message);
        } finally {
            setLoading(false);
        }
    };
    
    

    const handleShowModal = () => {
        setGroupname(group?.name || ""); // Ensure existing name is set before opening modal
        setShowModal(true);
    };

    const handleCloseModal = (updated) => {
        setShowModal(false);
        // if (updated) fetchGroupInfo();
    };

    const handleRemoveMember = async (memberId) => {

        try {
            const response = await Axios.post(`${baseURL}/groups/remove-member.php`, {
                group_id: Number(id), // pass current group ID
                member_id: memberId,
            });

            if (response.data.success) {
                // Refresh members list
                setMembers((prev) => prev.filter(m => m.member_id !== memberId));
            } else {
                alert(response.data.message || "Failed to remove member.");
            }
        } catch (error) {
            console.error(error);
           
        }
    };

    if (!group) return null;

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={6} className="border p-3 shadow rounded">
                    <h3 className='text-center'>{group.name} Group Members</h3>
                    {members.map((member) => (
                        <Row key={member.member_id} className='mt-5'>
                            <Col md={4} className="text-start">
                                <h5>
                                    {member.username} {member.member_id === captainid && <strong>*</strong>}
                                </h5>
                                <img 
                                    src={
                                        member.avatar
                                            ? `${baseURL}/user/uploads/${member.avatar}`
                                            : `${baseURL}/user/uploads/defalut_avatar.png`
                                    }
                                    alt="Profile" 
                                    className="rounded-circle mb-3" 
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                />
                            </Col>
                            <Col md={6} className="text-start">
                                <ul style={{ listStyleType: "none", padding: 0 }}>
                                    {["Wordle", "Connections", "Phrazle"].map((game) => (
                                        <li key={game}>
                                            <h5>{game}: {member.selected_games.includes(game) ? <FaCheck /> : <IoClose />}</h5>
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                            <Col md={2}>
                                {member.member_id !== captainid && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleRemoveMember(member.member_id)}
                                        className="mt-2"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    ))}

                    <div className='scoring-method my-4'>
                        <h4>Scoring Method</h4>
                        <h5>{scoringMethod}</h5>
                    </div>
                    <div>
                        <p><strong>*Captain</strong></p>
                        <Button className="btn btn-primary my-4" onClick={() => navigate(`/group/${group.id}/${group.name.toLowerCase().replace(/\s+/g, '-')}/stats`)}>Group Leaderboards</Button>
                        {userId === captainid && (
                           <>
                                <Button className="btn btn-warning my-2 mx-2" onClick={handleShowModal}>
                                    Edit Group
                                </Button>
                                <Button className="btn btn-danger my-2" onClick={handleDeleteGroup}>
                                    Delete Group
                                </Button>
                           </>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Group Edit Modal */}
            <GroupModal 
                showForm={showModal} 
                handleFormClose={handleCloseModal} 
                groupname={groupname}  // Ensure this is a state variable
                setGroupname={setGroupname} // Pass setter function
                group={group} 
                editMode={true} 
                onSubmit={handleUpdateGroup} 
                loading={loading}
            />

        </Container>
    );
}

export default GroupInfo;
