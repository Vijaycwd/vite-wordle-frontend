import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Form, Button, Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean']
  ]
};

function AdminText() {
  const baseURL = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    heading_pre: '',
    text1_pre: '',
    heading_post: '',
    text1_post: '',
    heading: '',
    text1: '',
    text2: '',
    text3: '',
    text4: '',
    text5: '',
    gameintro: '',
    firstname_label: '',
    firstname_desc: '',
    firstname_placeholder: '',
    lastname_label: '',
    lastname_desc: '',
    lastname_placeholder: '',
    username_label: '',
    username_desc: '',
    username_placeholder: '',
    email_label: '',
    email_desc: '',
    email_placeholder: '',
    phone_label: '',
    phone_desc: '',
    phone_placeholder: '',
    password_label: '',
    password_desc: '',
    password_placeholder: '',
    confirm_password_label: '',
    confirm_password_desc: '',
    confirm_password_placeholder: '',
    profile_picture_label: '',
    profile_picture_desc: '',
    profile_picture_placeholder: '',
    golf_modal_title: '',
    golf_modal_description: '',
    world_cup_modal_title: '',
    world_modal_cup_description: '',
    pesce_modal_title: '',
    pesce_modal_description: '',
    faqSections: []
  });

  const [recordExists, setRecordExists] = useState(false); // new state

  // Fetch existing homepage text on mount
  useEffect(() => {
    Axios.get(`${baseURL}/user/get-homepage-text.php`)
      .then((res) => {
        if (res.data && res.data.heading) {
          let parsedFaqs = [];

        try {
          parsedFaqs = typeof res.data.faq_sections === 'string'
            ? JSON.parse(res.data.faq_sections)
            : res.data.faq_sections;
        } catch (e) {
          console.error('Failed to parse faqSections:', e);
        }
          setFormData({
            heading_pre: res.data.heading_pre || '',
            text1_pre: res.data.text1_pre || '',
            heading_post: res.data.heading_post || '',
            text1_post: res.data.text1_post || '',
            heading: res.data.heading,
            text1: res.data.text1,
            text2: res.data.text2,
            text3: res.data.text3,
            text4: res.data.text4,
            text5: res.data.text5,
            gameintro: res.data.gameintro ?? '',
            firstname_label: res.data.firstname_label || '',
            firstname_desc: res.data.firstname_desc || '',
            firstname_placeholder: res.data.firstname_placeholder || '',
            lastname_label: res.data.lastname_label || '',
            lastname_desc: res.data.lastname_desc || '',
            lastname_placeholder: res.data.lastname_placeholder || '',
            username_label: res.data.username_label || '',
            username_desc: res.data.username_desc || '',
            username_placeholder: res.data.username_placeholder || '',
            email_label: res.data.email_label || '',
            email_desc: res.data.email_desc || '',
            email_placeholder: res.data.email_placeholder || '',
            phone_label: res.data.phone_label || '',
            phone_desc: res.data.phone_desc || '',
            phone_placeholder: res.data.phone_placeholder || '',
            password_label: res.data.password_label || '',
            password_desc: res.data.password_desc || '',
            password_placeholder: res.data.password_placeholder || '',
            confirm_password_label: res.data.confirm_password_label || '',
            confirm_password_desc: res.data.confirm_password_desc || '',
            confirm_password_placeholder: res.data.confirm_password_placeholder || '',
            profile_picture_label: res.data.profile_picture_label || '',
            profile_picture_desc: res.data.profile_picture_desc || '',
            profile_picture_placeholder: res.data.profile_picture_placeholder || '',
            golf_modal_title: res.data.golf_modal_title,
            golf_modal_description: res.data.golf_modal_description,
            world_cup_modal_title: res.data.world_cup_modal_title,
            world_cup_modal_description: res.data.world_cup_modal_description,
            pesce_modal_title: res.data.pesce_modal_title,
            pesce_modal_description: res.data.pesce_modal_description,
            faqSections: parsedFaqs
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

const addFaqSection = () => {
    if (formData.faqSections.length >= 5) {
      toast.warn("Limit reached: You can only add up to 5 FAQ categories.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      faqSections: [...prev.faqSections, { title: '', faqs: [{ question: '', answer: '' }] }]
    }));
  };

  const handleSectionTitleChange = (index, value) => {
    const updated = [...formData.faqSections];
    updated[index].title = value;
    setFormData(prev => ({ ...prev, faqSections: updated }));
  };

  const addFaqToSection = (sectionIndex) => {
    const updated = [...formData.faqSections];
    updated[sectionIndex].faqs.push({ question: '', answer: '' });
    setFormData(prev => ({ ...prev, faqSections: updated }));
  };

  const handleFaqChange = (sectionIndex, faqIndex, key, value) => {
    const updated = [...formData.faqSections];
    updated[sectionIndex].faqs[faqIndex][key] = value;
    setFormData(prev => ({ ...prev, faqSections: updated }));
  };

const removeFaqFromSection = (sectionIndex, faqIndex) => {
  const updated = [...formData.faqSections];
  updated[sectionIndex].faqs.splice(faqIndex, 1);
  setFormData(prev => ({ ...prev, faqSections: updated }));
};

const removeFaqSection = (sectionIndex) => {
  const updated = [...formData.faqSections];
  updated.splice(sectionIndex, 1);
  setFormData(prev => ({ ...prev, faqSections: updated }));
};

return (
  <Container className="mt-5">
    <Row className="justify-content-center">
      <Col md={8}>
        <Form onSubmit={handleSubmit}>
          <Tabs defaultActiveKey="homepage" id="label-tabs" className="mb-3">
            <Tab eventKey="homepage_pre" title="Homepage (Before Account Creation)">
              <h2 className="mb-4">Edit Pre-Account Homepage</h2>
              <Form.Group className="mb-3" controlId="heading_pre">
                <Form.Label>Heading</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Heading"
                  name="heading_pre"
                  value={formData.heading_pre}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="text1_pre">
                <Form.Label>Text 1</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.text1_pre}
                  onChange={(content) => setFormData(prev => ({ ...prev, text1_pre: content }))}
                />
              </Form.Group>
            </Tab>

            <Tab eventKey="homepage_post" title="Homepage (After Account Creation)">
              <h2 className="mb-4">Edit Post-Account Homepage</h2>
              <Form.Group className="mb-3" controlId="heading_post">
                <Form.Label>Heading</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Heading"
                  name="heading_post"
                  value={formData.heading_post}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="text1_post">
                <Form.Label>Text 1</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.text1_post}
                  onChange={(content) => setFormData(prev => ({ ...prev, text1_post: content }))}
                />
              </Form.Group>
            </Tab>

            <Tab eventKey="homepage" title="Homepage">
              <h2 className="mb-4">Edit Labels</h2>
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

              {/* <Form.Group className="mb-3" controlId="text3">
                <Form.Label>Text 3</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.text3}
                  onChange={(content) => setFormData(prev => ({ ...prev, text3: content }))}
                />
              </Form.Group> */}
            </Tab>
            <Tab eventKey="gameintro" title="Game Intro">
              <Form.Group className="mb-3" controlId="gameintro">
                <Form.Label>Game Intro</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={formData.gameintro}
                  onChange={(content) => setFormData(prev => ({ ...prev, gameintro: content }))}
                  modules={quillModules}
                />
              </Form.Group>
            </Tab>
            <Tab eventKey="registerform" title="Register Form">
            {/* First Name */}
            <Form.Group className="mb-3" controlId="firstname_label">
              <Form.Label>Firstname Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Label"
                name="firstname_label"
                value={formData.firstname_label || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="firstname_desc">
              <Form.Label>Firstname Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="firstname_desc"
                value={formData.firstname_desc || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="firstname_placeholder">
              <Form.Label>Firstname Placeholder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Placeholder"
                name="firstname_placeholder"
                value={formData.firstname_placeholder || ''}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Last Name */}
            <Form.Group className="mb-3" controlId="lastname_label">
              <Form.Label>Lastname Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Label"
                name="lastname_label"
                value={formData.lastname_label || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="lastname_desc">
              <Form.Label>Lastname Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="lastname_desc"
                value={formData.lastname_desc || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="lastname_placeholder">
              <Form.Label>Lastname Placeholder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Placeholder"
                name="lastname_placeholder"
                value={formData.lastname_placeholder || ''}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Username */}
            <Form.Group className="mb-3" controlId="username_label">
              <Form.Label>Username Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Label"
                name="username_label"
                value={formData.username_label || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="username_desc">
              <Form.Label>Username Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="username_desc"
                value={formData.username_desc || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="username_placeholder">
              <Form.Label>Username Placeholder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Placeholder"
                name="username_placeholder"
                value={formData.username_placeholder || ''}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-3" controlId="email_label">
              <Form.Label>Email Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Label"
                name="email_label"
                value={formData.email_label || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email_desc">
              <Form.Label>Email Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="email_desc"
                value={formData.email_desc || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email_placeholder">
              <Form.Label>Email Placeholder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Placeholder"
                name="email_placeholder"
                value={formData.email_placeholder || ''}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-3" controlId="phone_label">
              <Form.Label>Phone Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Label"
                name="phone_label"
                value={formData.phone_label || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="phone_desc">
              <Form.Label>Phone Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="phone_desc"
                value={formData.phone_desc || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="phone_placeholder">
              <Form.Label>Phone Placeholder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Placeholder"
                name="phone_placeholder"
                value={formData.phone_placeholder || ''}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3" controlId="password_label">
              <Form.Label>Password Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Label"
                name="password_label"
                value={formData.password_label || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password_desc">
              <Form.Label>Password Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="password_desc"
                value={formData.password_desc || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password_placeholder">
              <Form.Label>Password Placeholder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Placeholder"
                name="password_placeholder"
                value={formData.password_placeholder || ''}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="mb-3" controlId="confirm_password_label">
              <Form.Label>Confirm Password Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Label"
                name="confirm_password_label"
                value={formData.confirm_password_label || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirm_password_desc">
              <Form.Label>Confirm Password Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="confirm_password_desc"
                value={formData.confirm_password_desc || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirm_password_placeholder">
              <Form.Label>Confirm Password Placeholder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Placeholder"
                name="confirm_password_placeholder"
                value={formData.confirm_password_placeholder || ''}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Profile Picture */}
            <Form.Group className="mb-3" controlId="profile_picture_label">
              <Form.Label>Profile Picture Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Label"
                name="profile_picture_label"
                value={formData.profile_picture_label || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="profile_picture_desc">
              <Form.Label>Profile Picture Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="profile_picture_desc"
                value={formData.profile_picture_desc || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="profile_picture_placeholder">
              <Form.Label>Profile Picture Placeholder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Placeholder"
                name="profile_picture_placeholder"
                value={formData.profile_picture_placeholder || ''}
                onChange={handleChange}
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
            <Tab eventKey="faq" title="FAQ">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0"><strong>FAQ Sections</strong></h5>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={addFaqSection}
                    disabled={formData.faqSections.length >= 5}
                  >
                    + Add FAQ Section
                  </Button>
                </div>

                {formData.faqSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border p-3 rounded mb-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Section Title</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., USER EXPERIENCE"
                        value={section.title}
                        onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                      />
                    </Form.Group>

                    {section.faqs.map((faq, faqIndex) => (
                      <div key={faqIndex} className="mb-4 border rounded p-3">
                        <Form.Group className="mb-2">
                          <Form.Label>Question</Form.Label>
                          <Form.Control
                            type="text"
                            value={faq.question}
                            placeholder="Enter question"
                            onChange={(e) => handleFaqChange(sectionIndex, faqIndex, 'question', e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group>
                          <Form.Label>Answer</Form.Label>
                          <ReactQuill
                            theme="snow"
                            value={faq.answer}
                            onChange={(content) => handleFaqChange(sectionIndex, faqIndex, 'answer', content)}
                            modules={quillModules}
                          />
                        </Form.Group>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFaqFromSection(sectionIndex, faqIndex)}
                          className="mt-2"
                        >
                          Remove FAQ
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => addFaqToSection(sectionIndex)}
                    >
                      + Add FAQ to "{section.title || 'Untitled'}"
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFaqSection(sectionIndex)}
                      className="ms-2"
                    >
                      🗑 Remove Section
                    </Button>

                  </div>
                ))}
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
