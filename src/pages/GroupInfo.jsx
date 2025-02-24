import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

function GroupInfo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [captain, setCaptain] = useState(null);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchGroupInfo = async () => {
            try {
                const res = await Axios.post(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-members.php`, { group_id: id });
                if (res.data.status === "success") {
                    setGroup(res.data.group);
                    setCaptain(res.data.captain_name);
                    setMembers(res.data.members);
                } else {
                    toast.error("Group not found.");
                    
                }
            } catch (err) {
                toast.error("Failed to load group info.");
            }
        };

        fetchGroupInfo();
    }, [id, navigate]);
    console.log('captain',captain);
    if (!group) return null;
    return (
        <Container>
            <ToastContainer />
            <Row className="justify-content-center">
                <Col md={6} className="border p-3 shadow rounded">
                    <h3 className='text-center'>{group.name} Group Members</h3>
                    {members.map((member) => (
                        <Row className='mt-5'>
                            <Col className="text-start">
                                <h5>{member.username}</h5>
                            </Col>
                            <Col  className="text-start">
                                <ul style={{ listStyleType: "none", padding: 0 }}>
                                    {["Wordle", "Connections", "Phrasle"].map((game) => (
                                        <li key={game}>
                                            <h5>{game}: {member.selected_games.includes(game) ? "✅" : "❌"}</h5>
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                        </Row>
                    ))}
                    <p><strong>*Captain</strong></p>
                </Col>

            </Row>
            
        </Container>
    );
}

export default GroupInfo;
