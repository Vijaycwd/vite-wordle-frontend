import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

function GroupInfo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [captainid, setCaptainId] = useState(null);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchGroupInfo = async () => {
            try {
                const res = await Axios.post(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-members.php`, { group_id: id });
                if (res.data.status === "success") {
                    setGroup(res.data.group);
                    setCaptainId(res.data.captain_id); // Store captain's ID
                    setMembers(res.data.members);
                } else {
                    toast.error("Group not found.");
                }
            } catch (err) {
                toast.error("Failed to load group info.");
            }
        };

        fetchGroupInfo();
    }, [id]);

    
    if (!group) return null;
    console.log('Members',members);
    return (
        <Container>
            <ToastContainer />
            <Row className="justify-content-center">
                <Col md={6} className="border p-3 shadow rounded">
                    <h3 className='text-center'>{group.name} Group Members</h3>
                    {members.map((member) => (
                        <Row key={member.member_id} className='mt-5'>
                            <Col className="text-start">
                                <h5>
                                    {member.username} {member.member_id === captainid && <strong>*</strong>}
                                </h5>
                            </Col>
                            <Col className="text-start">
                                <ul style={{ listStyleType: "none", padding: 0 }}>
                                    {["Wordle", "Connections", "Phrazle"].map((game) => (
                                        <li key={game}>
                                            <h5>{game}: {member.selected_games.includes(game) ? <FaCheck /> : <IoClose />}</h5>
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                        </Row>
                    ))}
                    <p><strong>*Captain</strong></p>
                    <Button className="btn btn-primary my-4" onClick={() => navigate(`/group/${group.id}/${group.name.toLowerCase().replace(/\s+/g, '-')}/stats`)}>Group Stats</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default GroupInfo;
