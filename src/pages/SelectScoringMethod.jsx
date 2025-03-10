import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import Axios from 'axios';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SelectScoringMethod() {
    const { id } = useParams();
    const groupId = Number(id);
    const [selectedMethod, setSelectedMethod] = useState("");
    const [showModal, setShowModal] = useState(false);

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;

    const handleMethodSelection = (method) => {
        setSelectedMethod(method);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const saveSelectedMethod = async () => {
        if (!userId || !groupId || !selectedMethod) {
            toast.error("Invalid user, group, or method.");
            return;
        }

        try {
            const res = await Axios.post("https://coralwebdesigns.com/college/wordgamle/groups/update-scoring-method.php", {
                userId,
                groupId,
                scoringMethod: selectedMethod
            });

            if (res.data.status === "success") {
                toast.success("Scoring method updated!");
            } else {
                toast.error("Failed to update scoring method.");
            }
        } catch (err) {
            toast.error("Error updating scoring method.");
        }
    };

    return (
        <Container>
            <ToastContainer />
            <Row className="justify-content-center pt-4">
                <Col md={6}>
                    <div className="border p-3 shadow rounded mt-4">
                        <h5>Select Scoring Method:</h5>
                        <Form className="d-flex flex-wrap justify-content-center">
                            {["Golf", "World Cup", "Pesue"].map((method, index) => (
                                <div key={index} className="form-check mx-2">
                                    <input
                                        type="radio"
                                        className="form-radio-input"
                                        id={`method-${method}`}
                                        checked={selectedMethod === method}
                                        onChange={() => handleMethodSelection(method)}
                                    />
                                    <label className="form-check-label px-2" htmlFor={`method-${method}`}>
                                        {method}
                                    </label>
                                </div>
                            ))}
                        </Form>
                        <Button className="mt-3" onClick={saveSelectedMethod}>
                            Save Method
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
                            <p>Leaderboard Score = Game Score.</p>
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
                    {selectedMethod === "Pesue" && (
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
