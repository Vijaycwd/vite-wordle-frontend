import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';


function AdminText() {
  const baseURL = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    heading: '',
    text1: '',
    text2: '',
    text3: '',
  });

  const [recordExists, setRecordExists] = useState(false); // new state

  // Fetch existing homepage text on mount
  useEffect(() => {
    Axios.get(`${baseURL}/user/get-homepage-text.php`)
      .then((res) => {
        if (res.data && res.data.heading) {
          setFormData({
            heading: res.data.heading,
            text1: res.data.text1,
            text2: res.data.text2,
            text3: res.data.text3,
          });
          setRecordExists(true);
        }
      })
      .catch((err) => {
        console.error('Error fetching homepage text:', err);
      });
  }, [baseURL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await Axios.post(`${baseURL}/user/create-homepage-text.php`, formData);
    toast.success(response.data.message);
    setRecordExists(true); // now a record definitely exists
  } catch (error) {
    toast.error('Failed to save data.');
  }
};


return (
  <Container className="mt-5">
    <Row className="justify-content-center">
      <Col md={6}>
        <h2 className="mb-4">Edit Labels</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="heading">
            <Form.Label>Heading</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Heading"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="text1">
            <Form.Label>Text 1</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter text 1"
              name="text1"
              value={formData.text1}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="text2">
            <Form.Label>Text 2</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter text 2"
              name="text2"
              value={formData.text2}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="text3">
            <Form.Label>Text 3</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter text 3"
              name="text3"
              value={formData.text3}
              onChange={handleChange}
            />
          </Form.Group>


          <Button variant="primary" type="submit">
            {recordExists ? 'Update' : 'Submit'}
          </Button>
        </Form>
      </Col>
    </Row>
  </Container>
);
}

export default AdminText;
