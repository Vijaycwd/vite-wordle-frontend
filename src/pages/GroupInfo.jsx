import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import GroupModal from '../constant/Models/GroupModal';
import GroupExitConfirmModal from '../constant/Models/GroupExitConfirmModal';
import GroupDeleteConfirmModal from '../constant/Models/GroupDeleteConfirmModal';
import MemberProfile from '../constant/Models/MemberProfile';
import { FaTrash } from 'react-icons/fa';
// import InviteGroupandSite from './InviteGroupAndSite';
import GroupDeletePreference from '../constant/Models/GroupDeletePreference';
import RemoveMemberConfirmModal from '../constant/Models/RemoveMemberConfirmModal';

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
    const [deleteloading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;
    const [invites, setInvites] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showInviteDeleteModal, setShowInviteDeleteModal] = useState(false);
    const [selectedInviteId, setSelectedInviteId] = useState(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState(null);

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
                toast.error(response.data.message || "Failed to remove member.");
            }
        } catch (error) {
            console.error(error);
           
        }
    };
    const confirmDeleteGroup = async () => {
        setDeleteLoading(true);
        setShowDeleteConfirm(false);
        try {
            const res = await Axios.post(`${baseURL}/groups/delete-group.php`, { group_id: Number(id) });
            if (res.data.status === "success") {
                navigate('/groups');
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error("Error deleting group.");
        }finally {
            setDeleteLoading(false);
        }
        
    };

    const handleExitGroup = async () => {
    
        try {
        const response = await Axios.post(`${baseURL}/groups/exit-group.php`, {
            member_id: userId,
            group_id: group.id
        });

        if (response.data.success) {
            setShowExitConfirm(false);
            navigate('/groups'); 
        } else {
            console.log('error');
        }
        } catch (error) {
        console.error("Exit error:", error);
        
        }
   
    };


    useEffect(() => {
        fetchGroupInvites();
    }, [id]);
    const fetchGroupInvites = async () => {
        try {
          const response = await Axios.get(
            `${baseURL}/groups/get-group-invites.php?group_id=${id}`
          );
    
          const newInvites = Array.isArray(response.data.invitations)
            ? response.data.invitations
            : [];
    
          if (JSON.stringify(newInvites) !== JSON.stringify(invites)) {
            setInvites(newInvites);
          }
        } catch (error) {
          console.error('Error fetching invites:', error);
        }
      };
    const handleShowProfile = (member) => {
        setSelectedMember(member);
        setShowProfile(true);
    };
    if (!group) return null;

    const handleDeleteInvite = async (inviteId) => {
        try {
        const response = await Axios.post(`${baseURL}/groups/delete-invite.php`, {
            invite_id: inviteId
        });

        if (response.data.success) {
            setInvites((prevInvites) =>
                prevInvites.filter((invite) => invite.id !== inviteId)
            );
        } else {
            console.log('error');
        }
        } catch (error) {
        console.error("Exit error:", error);
        
        }
    };
    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={12} md={6} lg={6} className="border p-3 shadow rounded">
                    <h3 className="text-center">{group.name} Group Members</h3>

                    {members.map((member) => (
                    <Row
                    key={member.member_id}
                    className="mt-3 py-3 align-items-center border rounded"
                    style={{ flexWrap: 'nowrap' }}
                    >
                        {/* Avatar and username */}
                        <Col xs={5} md={4} lg={4} className="text-center text-md-start">
                            <div onClick={() => handleShowProfile(member)} style={{ cursor: 'pointer' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img
                                    src={
                                        member.avatar
                                        ? `${baseURL}/user/uploads/${member.avatar}`
                                        : `${baseURL}/user/uploads/default_avatar.png`
                                    }
                                    alt="Profile"
                                    className="rounded-circle mb-1"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                    <span
                                    className={`badge ${member.is_paused ? 'bg-danger' : 'bg-success'}`}
                                    style={{
                                        position: 'absolute',
                                        top: '0px',
                                        left: '45px',
                                        fontSize: '0.65rem',
                                        padding: '3px 6px',
                                        borderRadius: '8px'
                                    }}
                                    >
                                    {member.is_paused ? 'Inactive' : 'Active'}
                                    </span>
                                </div>

                                <h6 className="mt-1 mb-0">
                                    {member.username} {member.member_id === captainid && <strong><sup>*</sup></strong>}
                                </h6>
                                </div>

                        </Col>

                        {/* Selected Games */}
                        <Col xs={5}  md={6} lg={6}  className="text-start">
                            <ul style={{ listStyleType: 'none', padding: 0, marginBottom: 0 }}>
                            {["Wordle", "Connections", "Phrazle"].map((game) => (
                                <li key={game}>
                                <span>
                                    {game}: {member.selected_games.includes(game) ? <FaCheck /> : <IoClose />}
                                </span>
                                </li>
                            ))}
                            </ul>
                        </Col>

                        {/* Remove button */}
                        
                        {userId === captainid && (
                            <>
                        
                            <Col xs={2} md={2} lg={2}  className="text-center">
                                {member.member_id !== captainid && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedMemberId(member.member_id);
                                            setShowRemoveConfirm(true);
                                        }}
                                    >
                                        <FaTrash />
                                    </Button>

                                )}
                            </Col>
                        
                            </>
                        )} 
                    </Row>

                    ))}

                    {/* Scoring method */}
                    <div className="scoring-method my-4 text-md-start">
                    <h4>Scoring Method</h4>
                    <h5>{scoringMethod}</h5>
                    </div>

                    {/* Footer actions */}
                    <div className="text-md-start">
                        <p><strong>*Captain</strong></p>
                        <Row className="justify-content-center">
                            <Col xs={10} md={6}>
                                <Button
                                    className="me-md-2 w-100"
                                    onClick={() =>
                                    navigate(`/group/${group.id}/stats`)
                                    }
                                >
                                    Group Leaderboards
                                </Button>
                                {/* <InviteGroupandSite/> */}
                                <Button variant="danger" className="my-2 w-100" onClick={() => {setShowDeleteConfirm(true);}} disabled={loading}>
                                    {deleteloading? (
                                        <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />{' '}
                                        Deleting...
                                        </>
                                    ) : (
                                        'Delete Group'
                                    )}
                                </Button>
                            </Col>
                            {userId === captainid ? (
                            <>
                                <Col xs={10} md={6}>
                                <Button className="btn btn-warning w-100" onClick={handleShowModal}>
                                    Edit Group Name
                                </Button>
                                {/* <Button variant="danger" className="mt-2 w-100" onClick={() => {setShowDeleteConfirm(true);}} disabled={loading}>
                                    {deleteloading? (
                                        <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />{' '}
                                        Deleting...
                                        </>
                                    ) : (
                                        'Delete Group'
                                    )}
                                </Button> */}
                                </Col>
                            </>
                            ) : (
                            <Col xs={6} md={3}>
                                <Button className="btn btn-danger my-2" onClick={() => {setShowExitConfirm(true);}}>
                                Exit Group
                                </Button>
                            </Col>
                            )}

                        </Row>
                        {invites.length > 0 && userId === captainid && (
                        <Row className="my-4">
                            <Col>
                            <h5 className="mb-3">Invitations Pending Acceptance:</h5>
                            {invites.map((invite, i) => (
                            <Row key={i} className="align-items-center mb-3">
                                {/* Avatar */}
                                <Col xs="auto">
                                <img
                                    src={
                                    invite.avatar
                                        ? `${baseURL}/user/uploads/${invite.avatar}`
                                        : `${baseURL}/user/uploads/default_avatar.png`
                                    }
                                    alt="Profile"
                                    className="rounded-circle"
                                    style={{
                                    width: "30px",
                                    height: "30px",
                                    objectFit: "cover",
                                    }}
                                />
                                </Col>

                                {/* Name & username */}
                                <Col>
                                <strong>
                                    {invite.first_name} {invite.last_name}
                                </strong>
                                <br />
                                <small className="text-muted">@{invite.username}</small>
                                </Col>
                                {/* Delete Icon */}
                                <Col xs="auto" >
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedInviteId(invite.id);
                                            setShowInviteDeleteModal(true);
                                        }}
                                        >
                                        <FaTrash />
                                    </Button>
                                </Col>
                            </Row>
                            ))}
                            </Col>
                        </Row>
                        )}

                    </div>
                </Col>
            </Row>
            <MemberProfile
            show={showProfile}
            onHide={() => setShowProfile(false)}
            selectedMember={selectedMember}
            baseURL= {baseURL}
            />

            {/* Group Exit Modal */}            
            <GroupExitConfirmModal
            show={showExitConfirm}
            onHide={() => setShowExitConfirm(false)}
            onConfirm={() => {
                handleExitGroup();
                setShowExitConfirm(false);
            }}
            />        
            {/* Group Delete Modal */}
            <GroupDeleteConfirmModal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    confirmDeleteGroup();
                    setShowDeleteConfirm(false);
                }}
            /> 
            
            <RemoveMemberConfirmModal
                show={showRemoveConfirm}
                onHide={() => setShowRemoveConfirm(false)}
                onConfirm={() => {
                    handleRemoveMember(selectedMemberId);
                    setShowRemoveConfirm(false);
                }}
            />
            <GroupDeletePreference
                show={showInviteDeleteModal}
                onHide={() => setShowInviteDeleteModal(false)}
                onConfirm={() => {
                    handleDeleteInvite(selectedInviteId);
                    setShowInviteDeleteModal(false);
                }}
            />  
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
