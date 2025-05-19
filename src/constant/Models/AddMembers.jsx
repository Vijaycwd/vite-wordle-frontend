import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Axios from "axios";
import { toast } from 'react-toastify';
import Select from "react-select";

const AddMembers = ({ showForm, handleFormClose, groupName, groupId, existingMembers = [] }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCaptain, setSelectedCaptain] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
  const loggedInUserId = String(userAuthData.id || "");
  const loggedInUsername = userAuthData.username || "";

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await Axios.get("https://coralwebdesigns.com/college/wordgamle/groups/get-groups.php");
        setGroups(res.data.groups || []);
      } catch (err) {
        console.error("Failed to fetch groups");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await Axios.get("https://coralwebdesigns.com/college/wordgamle/groups/get-user.php");
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Failed to fetch users");
      }
    };

    fetchGroups();
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedGroupName = groups.find(group => String(group.id) === String(selectedGroup))?.name || "Unknown Group";
    const groupData = {
      group_id: selectedGroup,
      group_name: selectedGroupName,
      captain_id: selectedCaptain,
      members: selectedMembers.map(member => member.value),
    };

    try {
      const res = await Axios.post("https://coralwebdesigns.com/college/wordgamle/groups/add-group-members.php", groupData);
      if (res.data.status === "success") {
        toast.success(res.data.message, { position: "top-center" });
        handleFormClose();
        setSelectedGroup('');
        setSelectedCaptain('');
        setSelectedMembers([]);
      } else {
        toast.error(res.data.message, { position: "top-center" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An unexpected error occurred.', { position: "top-center" });
    }
  };

  const frontendBaseUrl = window.location.origin;

  const handleSendInvitation = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select a group and at least one member.");
      return;
    }

    try {
      const invitations = selectedMembers.map(member => ({
        group_id: groupId,
        group_name: groupName,
        invited_user_id: member.value,
        invited_user_name: member.label,
        frontendBaseUrl
      }));

      await Promise.all(invitations.map(invite =>
        Axios.post("https://coralwebdesigns.com/college/wordgamle/groups/send-invite.php", invite)
      ));

      toast.success("Invitations sent successfully!");
      handleFormClose();
    } catch (error) {
      toast.error("Failed to send invitations.");
    }
  };

  const filteredUsers = users.filter(user =>
    String(user.id) !== String(selectedCaptain) &&
    String(user.id) !== String(loggedInUserId) &&
    !existingMembers.includes(String(user.id)) // exclude already joined
  );

  return (
  <>
    <Modal show={showForm} onHide={handleFormClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Members</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Group</Form.Label>
            <Form.Control type="text" readOnly value={groupName} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Captain</Form.Label>
            <Form.Control type="text" readOnly value={loggedInUsername} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Invite Group Members</Form.Label>
            <Select
              isMulti
              options={filteredUsers
                .filter(user => {
                  const input = searchInput.toLowerCase();
                  return (
                    searchInput.length >= 3 &&
                    (
                      user.first_name?.toLowerCase().includes(input) ||
                      user.last_name?.toLowerCase().includes(input) ||
                      user.username?.toLowerCase().includes(input)
                    )
                  );
                })
                .map(user => ({
                  value: user.id,
                  label: `${user.first_name} ${user.last_name} (${user.username})`,
                }))}
              value={selectedMembers}
              onChange={setSelectedMembers}
              onInputChange={(input) => setSearchInput(input)}
              placeholder="Type at least 3 characters to search..."
              noOptionsMessage={() =>
                searchInput.length < 3 ? "Type at least 3 letters..." : "No users found"
              }
            />
          </Form.Group>

          <Button variant="success" onClick={handleSendInvitation}>
            Send Invitations
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleFormClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
   
  </>
);

};

export default AddMembers;
