import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AddMembers from '../constant/Models/AddMembers';

function GroupPage() {
    const { groupName } = useParams();
    const [showMemberForm, setShowMemberForm] = useState(false);

    const handleMemberFormClose = () => setShowMemberForm(false);
    const handleShowMemberForm = () => setShowMemberForm(true);

    return (
        <Container className="text-center">
            <h2>{groupName} Group</h2>
            <Button className="wordle-btn px-5 mt-3" onClick={handleShowMemberForm}>
                Add Group Members
            </Button>

            {/* Add Members Modal */}
            <AddMembers
                showForm={showMemberForm}
                handleFormClose={handleMemberFormClose}
                groupName={groupName} // Pass group name
            />
        </Container>
    );
}

export default GroupPage;
