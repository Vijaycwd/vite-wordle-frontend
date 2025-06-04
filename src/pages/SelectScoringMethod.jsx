import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal, Spinner } from 'react-bootstrap';
import Axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function SelectScoringMethod() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const { id } = useParams();
    const groupId = Number(id);
    const [selectedMethod, setSelectedMethod] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [scoringmethod, setScoringMethod] = useState("");
    const [loading, setLoading] = useState(false);
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;

    // Fetch scoring method from backend
    useEffect(() => {
        const fetchScoringMethod = async () => {
            try {
                const res = await Axios.get(`${baseURL}/groups/get-scoring-method.php`, {
                    params: { user_id: userId, group_id: id }
                });

                // console.log("Fetched Scoring Method:", res.data.scoring_method);

                if (res.data.status === "success") {
                    setScoringMethod(res.data.scoring_method || ""); // Default to empty string
                } else {
                    toast.error("Scoring Method not found.");
                }
            } catch (err) {
                toast.error("Failed to load group info.");
            }
        };

        if (id && userId) {  
            fetchScoringMethod();
        }
    }, [id, userId]); 

    // Handle method selection
    const handleMethodSelection = (method) => {
        setSelectedMethod(method);
        setScoringMethod(method);  // Update the radio button state immediately
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    // Save selected method to backend
    const saveSelectedMethod = async () => {
        setLoading(true);
        if (!userId || !groupId || !selectedMethod) {
            toast.error("Invalid user, group, or method.");
            return;
        }

        try {
            const res = await Axios.post(`${baseURL}/groups/update-scoring-method.php`, {
                userId,
                groupId,
                scoringMethod: selectedMethod
            });

            if (res.data.status === "success") {
                toast.success("Scoring method updated!");
                setScoringMethod(selectedMethod); // Update UI immediately
            } else {
                toast.error("Failed to update scoring method.");
            }
        } catch (err) {
            toast.error("Error updating scoring method.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-center pt-4">
                <Col md={6}>
                    <div className="border p-3 shadow rounded mt-4">
                        <h5>Select Scoring Method:</h5>
                        <p>Click on each Method to see how your group Leaderboards will be scored.</p>
                        <Form className="d-flex flex-wrap justify-content-center">
                            {["Golf", "World Cup", "Pesce"].map((method, index) => (
                                <div key={index} className="form-check mx-2">
                                    <input
                                        type="radio"
                                        className="form-radio-input"
                                        id={`method-${method}`}
                                        checked={scoringmethod === method}  // Ensure correct method is checked
                                        onChange={() => handleMethodSelection(method)}
                                    />
                                    <label className="form-check-label px-2" htmlFor={`method-${method}`}>
                                        {method}
                                    </label>
                                </div>
                            ))}
                        </Form>
                        <Button className="mt-3" onClick={saveSelectedMethod} disabled={loading} >
                            {loading ? (
                                <>
                                <Spinner animation="border" size="sm" /> Updating...
                                </>
                            ) : (
                               "Save Method"
                            )}
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Modal to show method details */}
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedMethod} Method Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMethod === "Golf" && (
                        <div>
                            <p>Low score wins.</p>
                            <p>Leaderboard Score = Gamle Score.</p>
                        </div>
                    )}
                    {selectedMethod === "World Cup" && (
                        <div>
                            <p>High score wins.</p>
                            <p>Win = 3 Leaderboard points.</p>
                            <p>Tie for win = 1 Leaderboard point.</p>
                            <p>Loss or No Play = 0 Leaderboard points.</p>
                        </div>
                    )}
                    {selectedMethod === "Pesce" && (
                        <div>
                            <p>High score wins.</p>
                            <p>Win or Tie for Win = 1 Leaderboard point.</p>
                            <p>Loss or No Play = 0 Leaderboard points.</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default SelectScoringMethod;
