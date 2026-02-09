import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Spinner, Button } from "react-bootstrap";
import Axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

function GameNotificationToggle() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const { id: groupId } = useParams();

    const USER_AUTH_DATA = JSON.parse(localStorage.getItem("auth"));
    const userId = USER_AUTH_DATA?.id;

    // 🔔 Saved value from DB
    const [notificationMode, setNotificationMode] = useState("");

    // 📝 Temporary value (UI only)
    const [selectedMode, setSelectedMode] = useState("");

    const [loading, setLoading] = useState(false);

    //1️⃣ Fetch notification preference
    useEffect(() => {
        const fetchNotificationMode = async () => {
            try {
                const res = await Axios.get(
                    `${baseURL}/groups/get-notification-preference.php`,
                    {
                        params: {
                            user_id: userId,
                            group_ids: groupId
                        }
                    }
                );
                
                if (res.data.status === "success") {
                    const mode = res.data.modes[groupId];
                    setNotificationMode(mode);
                    setSelectedMode(mode);
                }

            } catch (error) {
                toast.error("Failed to load preferences");
            }
        };

        if (userId && groupId) {
            fetchNotificationMode();
        }
    }, [userId, groupId]);

    // 2️⃣ Save button click
    const handleSave = async () => {
        if (selectedMode === notificationMode) {
            toast.info("No changes to save");
            return;
        }

        setLoading(true);

        try {
            const res = await Axios.post(
                `${baseURL}/groups/update-notification-mode.php`,
                {
                    user_id: userId,
                    group_id: groupId,
                    notification_mode: selectedMode
                }
            );

            if (res.data.status === "success") {
                setNotificationMode(selectedMode);
                toast.success("Notification preference updated");
            } else {
                toast.error("Update failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-center pt-4">
                <Col md={6}>
                    <div className="border p-3 shadow rounded mt-4">

                        <h5 className="mb-3">Notification Preferences</h5>

                        <Form>
                            {/* 🔕 MUTE ALL */}
                            <Form.Check
                                type="radio"
                                name="notificationMode"
                                id="mute-all"
                                label="Mute all notifications"
                                checked={selectedMode == "MUTE_ALL"}
                                onChange={() => setSelectedMode("MUTE_ALL")}
                                disabled={loading}
                                className="mb-2 d-flex justify-content-center gap-2"
                            />

                            {/* 🎮 EXCEPT GAME COMPLETE */}
                            <Form.Check
                                type="radio"
                                name="notificationMode"
                                id="mute-except-complete"
                                label="Mute all except Game Complete"
                                checked={selectedMode == "EXCEPT_GAME_COMPLETE"}
                                onChange={() => setSelectedMode("EXCEPT_GAME_COMPLETE")}
                                disabled={loading}
                                className="d-flex justify-content-center gap-2"
                            />
                        </Form>

                        <div className="mt-3">
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" animation="border" /> Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>

                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default GameNotificationToggle;
