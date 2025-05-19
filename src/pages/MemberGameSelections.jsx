import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';

function MemberGameSelections() {
    const { id: groupId } = useParams(); // Get group ID from URL
    const [selectedGames, setSelectedGames] = useState([]);
    const [Games, setGames] = useState([]); // Store selected games from backend
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem("auth"));
    const userId = USER_AUTH_DATA?.id;

    useEffect(() => {
        const fetchSelectedGames = async () => {
            if (!groupId || !userId) return;
            try {
                const res = await Axios.get("https://coralwebdesigns.com/college/wordgamle/groups/get-selected-games.php", {
                    params: { user_id: userId, group_id: groupId }
                });
    
                if (res.data.status === "success") {
                    let fetchedGames = res.data.selected_games;
    
                    if (typeof fetchedGames === "string") {
                        fetchedGames = fetchedGames.split(",").map(game => game.trim()); // Convert string to array
                    }
    
                    if (Array.isArray(fetchedGames)) {
                        setGames(fetchedGames);
                        setSelectedGames(fetchedGames); // Update checkboxes
                    } else {
                        console.error("Invalid data format for selected games:", fetchedGames);
                    }
                } else {
                    toast.error("Scoring method not found.");
                }
            } catch (err) {
                toast.error("Failed to load group info.");
            }
        };
    
        fetchSelectedGames();
    }, [groupId, userId]);
    

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

    console.log("Fetched Games:", Games);
    console.log("Selected Games:", selectedGames);

    return (
        <Container>
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
