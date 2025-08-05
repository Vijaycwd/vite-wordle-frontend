import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import dayjs from "dayjs";

const GetGroupMessagesModal = ({ groupId, gameName, periodDate, periodType }) => {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const [show, setShow] = useState(false);
    const [messages, setMessages] = useState([]);

    const handleShow = async () => {
        setShow(true);
        try {
        const baseParams = {
            group_id: groupId,
            game_name: gameName,
            created_at: periodDate
        };
        const params = gameName === 'phrazle'
        ? { ...baseParams, period: periodType }
        : baseParams;
        const response = await axios.get(
            `${baseURL}/groups/get-user-messages.php`,{ params });
        setMessages(response.data);
        } catch (error) {
        console.error("Failed to fetch messages:", error);
        }
    };

    const handleClose = () => setShow(false);

    return (
        <>
        <div className='text-center my-4'>
            <Button className={`${gameName}-btn`} onClick={handleShow}>
                Messages {dayjs(periodDate).format("MMM, D YYYY")}{gameName === 'phrazle' ? ` - ${periodType}` : ''}
            </Button>

        </div>

        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
            <Modal.Title>Group Messages</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {messages.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <ul className="list-unstyled">
                    {messages.map((msg, index) => (
                        <li key={index} className="mb-3">
                        <div className="d-flex align-items-center">
                            <img
                            src={
                                msg.avatar
                                ? `${baseURL}/user/uploads/${msg.avatar}`
                                : `${baseURL}/user/uploads/defalut_avatar.png`
                            }
                            width={40}
                            height={40}
                            className="rounded-circle me-2"
                            />
                            <strong>{msg.username}</strong>
                        </div>
                        <div className="ms-5">{msg.message}</div>
                        <small className="ms-5 text-muted">{dayjs(msg.created_at).format("MMM, D YYYY")}</small>
                        </li>
                    ))}
                    </ul>
                </div>
            ) : (
                <p>No messages found for the selected date.</p>
            )}
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default GetGroupMessagesModal;
