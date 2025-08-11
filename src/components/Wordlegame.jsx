import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal, Form, FloatingLabel } from 'react-bootstrap';
import Axios from "axios";
import { useNavigate } from 'react-router-dom';
import Wordlelogo from './images/wordle.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Wordlegame = (props) => {
    const [show, setShow] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const handleClose = () => setShow(false);
    const handleformClose = () => setShowForm(false);
    const [showForm, setShowForm] = useState(false);
    
    const handleShow = (content) => {
      setModalContent(content);
      setShow(true);
    };
    const handleNavigation = (url) => {
        window.open(url, '_blank');
        setShowForm(true);
        setShow(false);
    };
    const navigate = useNavigate();
    const handleWordlestate = async (event) => {
        event.preventDefault();
        navigate('/wordlestats');
    }
    const [score, setScore] = useState();
    
    let createWordle = "";

    const loginusername = props.loginUserData.username;
    const loginuseremail = props.loginUserData.email;
    const onSubmit = async (event) => {
      event.preventDefault();
      setScore('');
      const wordleObject = {
          username: loginusername,
          useremail:loginuseremail,
          wordlescore: score,
          createdAt: new Date().toISOString(),
      }
      Axios.post('https://wordle-server-gf3r.onrender.com/wordle/wordle-score', wordleObject)
      .then( res =>{
          if(res){
              createWordle = res.data;
              console.log("created", createWordle);
          }
      })
      .catch((err) => {
        console.error(err.response.data.message);
        const errorMsg = err.response.data.message
        toast.error(errorMsg, {
          position: "top-center"
        });
      })

      setShowForm(false);
    }
    // const [data, setData] = useState(null);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);

    // useEffect(() => {
    //   getData();
    // }, []);
    // function getData() {
    //   Axios.get(
    //     "https://wordle-server-gf3r.onrender.com/wordle"
    //   )
    //   .then((response) => {
    //     setData(response.data);
    //     // console.log("check", data, response.data);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching data: ", error);
    //     setError(error);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
    // }
    console.log(props.loginUserData.username);
  
    return (
      <>  
        <ToastContainer/>
        <Container>
          <Row>
              <Col>
                <div className="mb-2">
                  <Button  className="wordle-btn" size="lg" onClick={() => handleShow('WORDLE')}>
                    Enter Wordle
                  </Button>
                </div>
              </Col>
              <Col>
                <div className="mb-2">
                  <Button  className="wordle-btn" size="lg" onClick={handleWordlestate}>
                    Wordle Stats
                  </Button>
                </div>
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

        <Modal show={showForm} onHide={handleformClose}>
          <Modal.Header closeButton>
          </Modal.Header>
          <Modal.Body>
          <img className='img-fluid d-block m-auto' alt="wordle-logo" style={{width:"100px"}} src= {Wordlelogo}></img>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter Name" value={loginusername} readonly/>
                <Form.Text className="text-muted">
                </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Your Score</Form.Label>
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleformClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  export default Wordlegame;