import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";

const AddMembers = ({ showForm, handleFormClose, onSubmit }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCaptain, setSelectedCaptain] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Fetch Groups and Users from DB
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await Axios.get(
          "https://coralwebdesigns.com/college/wordgamle/groups/get-groups.php"
        );
        setGroups(res.data.groups || []);
      } catch (err) {
        console.error("Failed to fetch groups");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await Axios.get(
          "https://coralwebdesigns.com/college/wordgamle/groups/get-user.php"
        );
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
        handleFormClose(); // Close modal
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

  const handleSendInvitation = async () => {
    if (!selectedGroup || selectedMembers.length === 0) {
        toast.error("Please select a group and at least one member.");
        return;
    }

    try {
        const invitations = selectedMembers.map(member => ({
            group_id: selectedGroup,
            group_name: groups.find(group => String(group.id) === String(selectedGroup))?.name || "Unknown Group",
            invited_user_id: member.value,
            invited_user_name: member.label,
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

  const filteredUsers = users.filter(user => String(user.id) !== String(selectedCaptain));

  return (
    <Modal show={showForm} onHide={handleFormClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Members to Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Choose Group</Form.Label>
            <Form.Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} required>
              <option value="">Choose a group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nominate Captain</Form.Label>
            <Select
              isSearchable={true}
              options={users.map(user => ({ value: user.id, label: user.username }))}
              value={users.find(user => user.id === selectedCaptain) ? { value: selectedCaptain, label: users.find(user => user.id === selectedCaptain)?.username } : null}
              onChange={(selected) => setSelectedCaptain(selected?.value || "")}
              placeholder="Search and select a captain..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Invite Group Members</Form.Label>
            <Select
              isMulti
              options={filteredUsers.map(user => ({ value: user.id, label: user.username }))}
              value={selectedMembers}
              onChange={setSelectedMembers}
              placeholder="Search and select members..."
            />
          </Form.Group>

          {/* <Button variant="primary" type="submit">
            Add Members
          </Button> */}
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
  );
};

export default AddMembers;
