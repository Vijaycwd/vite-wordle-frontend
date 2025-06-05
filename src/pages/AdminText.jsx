import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Form, Button, Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


function AdminText() {
  const baseURL = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    heading: '',
    text1: '',
    text2: '',
    text3: '',
    text4: '',
    text5: '',
    golf_modal_title: '',
    golf_modal_description: '',
    world_cup_modal_title: '',
    world_modal_cup_description: '',
    pesce_modal_title: '',
    pesce_modal_description: ''
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
            text4: res.data.text4,
            text5: res.data.text5,
            golf_modal_title: res.data.golf_modal_title,
            golf_modal_description: res.data.golf_modal_description,
            world_cup_modal_title: res.data.world_cup_modal_title,
            world_cup_modal_description: res.data.world_cup_modal_description,
            pesce_modal_title: res.data.pesce_modal_title,
            pesce_modal_description: res.data.pesce_modal_description
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
      <Col md={8}>
        <Form onSubmit={handleSubmit}>
          <Tabs defaultActiveKey="homepage" id="label-tabs" className="mb-3">
            <Tab eventKey="homepage" title="Homepage">
              <h2 className="mb-4">Edit Labels</h2>
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
                <ReactQuill
                  theme="snow"
                  value={formData.text1}
                  onChange={(content) => setFormData(prev => ({ ...prev, text1: content }))}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="text2">
                <Form.Label>Text 2</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.text2}
                  onChange={(content) => setFormData(prev => ({ ...prev, text2: content }))}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="text3">
                <Form.Label>Text 3</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.text3}
                  onChange={(content) => setFormData(prev => ({ ...prev, text3: content }))}
                />
              </Form.Group>
            </Tab>

            <Tab eventKey="leaderboard" title="Leaderboard">
              <Form.Group className="mb-3" controlId="text4">
                <Form.Label>Leaderboard Games Description</Form.Label>
                {/* <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter Description"
                  name="text4"
                  value={formData.text4}
                  onChange={handleChange}
                /> */}
                <ReactQuill
                  theme="snow"
                  value={formData.text4}
                  onChange={(content) => setFormData(prev => ({ ...prev, text4: content }))}
                />

              </Form.Group>

              <Form.Group className="mb-3" controlId="text5">
                <Form.Label>Scoring Method Description</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.text5}
                  onChange={(content) => setFormData(prev => ({ ...prev, text5: content }))}
                />
              </Form.Group>
            </Tab>
            <Tab eventKey="scoring" title="Scoring Methods Modal">
              <h5 className='my-3'>Golf Method</h5>
              <Form.Group className="mb-3" controlId="text6">
                <Form.Label>Modal Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Title"
                  name="golf_modal_title"
                  value={formData.golf_modal_title}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="text7">
                <Form.Label>Method Description</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.golf_modal_description}
                  onChange={(content) => setFormData(prev => ({ ...prev, golf_modal_description: content }))}
                />
              </Form.Group>
              <h5 className='my-3'>World Cup Method</h5>
              <Form.Group className="mb-3" controlId="text8">
                <Form.Label>Modal Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Title"
                  name="world_cup_modal_title"
                  value={formData.world_cup_modal_title}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="text9">
                <Form.Label>World Cup Method Description</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.world_cup_modal_description}
                  onChange={(content) => setFormData(prev => ({ ...prev, world_cup_modal_description: content }))}
                />
              </Form.Group>
              <h5 className='my-3'>Pesce Method</h5>
              <Form.Group className="mb-3" controlId="text10">
                <Form.Label>Modal Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Title"
                  name="pesce_modal_title"
                  value={formData.pesce_modal_title}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="text11">
                <Form.Label>Pesce Method Description</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.pesce_modal_description}
                  onChange={(content) => setFormData(prev => ({ ...prev, pesce_modal_description: content }))}
                />
              </Form.Group>
            </Tab>
          </Tabs>
          
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
