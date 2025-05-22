import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form, FloatingLabel } from 'react-bootstrap';
import Axios from "axios";

const Games = () => {
    const [show, setShow] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const handleClose = () => setShow(false);
    const [showForm, setShowForm] = useState(false);
    const [showwordleform, setShowwordleform] = useState(true);
    const [showwordlebtn, setShowwordlebtn] = useState(true);
    const [showconnbtn, setShowconnbtn] = useState(true);
    const [showphrazlebtn, setShowphrazlebtn] = useState(true);
    
    const handleShow = (content) => {
      setModalContent(content);
      setShow(true);
    };
    const handleNavigation = (url) => {
        window.open(url, '_blank');
        setShowForm(true);
        setShow(false);
        setShowconnbtn(false);
        setShowphrazlebtn(false);
    };

    const [name, setName] = useState();
    const [score, setScore] = useState();
    
    let createWordle = "";

    const onSubmit = async (event) => {
      event.preventDefault();
      setName('');
      setScore('');
      const wordleObject = {
          name: name,
          wordlescore: score,
      }
      console.log(wordleObject);
      Axios.post('http://localhost:5001/wordle/wordle-score', wordleObject)
      .then( res =>{
          if(res){
              createWordle = res.data;
              console.log("created", createWordle);
          }
      })
      .catch((err) => {console.error(err.response.data);})
    }
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      getData();
    }, []);
    function getData() {
      Axios.get(
        "http://localhost:5001/wordle"
      )
      .then((response) => {
        setData(response.data);
        console.log("check employe list", data, response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
    }
    
    return (
      <>  
        <Container>
          <Row className="d-flex align-items-center text-center" style={{ height: '50vh' }}>
            {showwordlebtn && (
              <Col md={4}>
                <div className="mb-2">
                  <Button  className="w-100 wordle-btn" size="lg" onClick={() => handleShow('WORDLE')}>
                    WORDLE
                  </Button>
                </div>
              </Col>
            )

            }
            {showconnbtn && (
              <Col>
                <div className="mb-2">
                  <Button className="w-100  connections-btn" size="lg" onClick={() => handleShow('CONNECTIONS')}>
                    CONNECTIONS
                  </Button>
                </div>
              </Col>
            )

            }
            {showphrazlebtn && (
              <Col>
                <div className="mb-2">
                  <Button  className="w-100  phrazle-btn" size="lg" onClick={() => handleShow('PHRAZLE')}>
                    PHRAZLE
                  </Button>
                </div>
              </Col>
            )

            }
          </Row>
        </Container>
        <Container>
          <Row>
            <Col>
            {/* {data.map((score, key) => (
            <div key={key}>
              <div className="score-board">{score.wordlescore}</div>
            </div>
          ))} */}
            </Col>
          </Row>
        </Container>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{modalContent}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
                <p>Go to Third party site. Please paste the score from the wordle game</p>
                <Button variant="primary" size="lg" onClick={() => handleNavigation('https://www.nytimes.com/games/wordle/index.html')}>
                Play
            </Button>
            </div> 
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {showForm && (
        <Container>
        <Row>
          <Col md={4}>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter Name" value={name} onChange={(event) => { setName(event.target.value);}}/>
              <Form.Text className="text-muted">
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>Score</Form.Label>
              <FloatingLabel controlId="floatingTextarea2" label="">
                <Form.Control
                  as="textarea" value={score} onChange={(event) => { setScore(event.target.value);}}
                  style={{ height: '100px' }}
                />
              </FloatingLabel>
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
          </Col>
        </Row>
      </Container>
       )}

      <Modal showwordleform={showwordleform} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{modalContent}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
                <p>Go to Third party site. Please paste the score from the wordle game</p>
                <Button variant="primary" size="lg" onClick={() => handleNavigation('https://www.nytimes.com/games/wordle/index.html')}>
                Play
            </Button>
            </div> 
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
  
  
  export default Games;