import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Axios from 'axios';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MemberGameSelections() {
    const { id: groupId } = useParams(); // Get group ID from URL
    const [selectedGames, setSelectedGames] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]); // Store group members and their selected games

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;

    // Fetch user’s selected games
    useEffect(() => {
        const fetchSelectedGames = async () => {
            try {
                const res = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-members.php?groupId=${groupId}`);
                if (res.data.status === "success") {
                    setSelectedGames(res.data.selectedGames || []);
                }
            } catch (err) {
                console.error("Error fetching selected games:", err);
            }
        };

        if (userId && groupId) fetchSelectedGames();
    }, [userId, groupId]);

    const handleGameSelection = (game) => {
        setSelectedGames((prevGames) =>
            prevGames.includes(game)
                ? prevGames.filter((g) => g !== game) // Remove if already selected
                : [...prevGames, game] // Add if not selected
        );
    };

    const saveSelectedGames = async () => {
        if (!userId || !groupId) {
            toast.error("Invalid user or group.");
            return;
        }
    
        // Fetch latest selected games before making the request
        try {
            const res = await Axios.get(`https://coralwebdesigns.com/college/wordgamle/groups/get-group-members.php?groupId=${groupId}`);
            if (res.data.status === "success") {
                const existingGames = res.data.selectedGames || [];
    
                // Check if selectedGames is different before sending
                if (JSON.stringify(existingGames.sort()) === JSON.stringify(selectedGames.sort())) {
                    toast.info("No changes detected.");
                    return;
                }
            }
        } catch (err) {
            console.error("Error fetching current game selections:", err);
        }
    
        try {
            const res = await Axios.post("https://coralwebdesigns.com/college/wordgamle/groups/update-games.php", {
                userId,
                groupId,
                selectedGames
            });
    
            if (res.data.status === "success") {
                toast.success("Game preferences updated!");
            } else {
                toast.error("Failed to update preferences.");
            }
        } catch (err) {
            toast.error("Error updating game preferences.");
        }
    };
    
    return (
        <Container>
            <ToastContainer />
            <Row className="justify-content-center pt-4">
                <Col md={6}>
                    <div className="border p-3 shadow rounded mt-4">
                        <h5>Select Games to be Tracked:</h5>
                        <Form className="d-flex flex-wrap justify-content-center">
                            {["Wordle", "Connections", "Phrazle"].map((game, index) => (
                                <div key={index} className="form-check mx-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`game-${game}`}
                                        checked={selectedGames.includes(game)}
                                        onChange={() => handleGameSelection(game)}
                                    />
                                    <label className="form-check-label" htmlFor={`game-${game}`}>
                                         {game} 
                                    </label>
                                </div>
                            ))}
                        </Form>
                        <Button className="mt-3" onClick={saveSelectedGames}>
                            Save Preferences
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default MemberGameSelections;
