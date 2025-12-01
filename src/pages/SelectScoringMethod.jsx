import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal, Spinner } from 'react-bootstrap';
import Axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from "dayjs";

function SelectScoringMethod({ leaderboardText }) {
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
                scoringMethod: selectedMethod,
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss")
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
                        <p dangerouslySetInnerHTML={{ __html: leaderboardText.text5 }}></p>
                        <Form className="d-flex flex-wrap justify-content-center scoring-method-form">
                        {["Golf", "World Cup", "Pesce"].map((method, index) => (
                            <div key={index} className="form-check mx-2">
                            <input
                                type="radio"
                                className="form-radio-input" // hide default radio if desired
                                id={`method-${method}`}
                                checked={scoringmethod === method}
                                onChange={() => handleMethodSelection(method)}
                            />
                            <label
                                className={`form-check-label scoring-label px-2 ${scoringmethod === method ? "text-primary fw-bold" : "text-primary"}`}
                                htmlFor={`method-${method}`}
                                style={{ cursor: "pointer" }}
                            >
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
                    <Modal.Title>
                        {selectedMethod === "Golf" && (
                            <div
                            dangerouslySetInnerHTML={{
                                __html: leaderboardText.golf_modal_title.replace(/\\n/g, '')
                            }}
                            ></div>
                        )}
                        {selectedMethod === "World Cup" && (
                            <div
                            dangerouslySetInnerHTML={{
                                __html: leaderboardText.world_cup_modal_title.replace(/\\n/g, '')
                            }}
                            ></div>
                        )}
                        {selectedMethod === "Pesce" && (
                            <div
                            dangerouslySetInnerHTML={{
                                __html: leaderboardText.pesce_modal_title.replace(/\\n/g, '')
                            }}
                            ></div>
                        )}
                        
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMethod === "Golf" && (
                        <div
                        dangerouslySetInnerHTML={{
                            __html: leaderboardText.golf_modal_description.replace(/\\n/g, '')
                        }}
                        ></div>
                    )}
                    {selectedMethod === "World Cup" && (
                        <div
                        dangerouslySetInnerHTML={{
                            __html: leaderboardText.world_cup_modal_description.replace(/\\n/g, '')
                        }}
                        ></div>
                       
                    )}
                    {selectedMethod === "Pesce" && (
                        <div
                        dangerouslySetInnerHTML={{
                            __html: leaderboardText.pesce_modal_description.replace(/\\n/g, '')
                        }}
                        ></div>
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
