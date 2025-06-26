import React, { useEffect, useState } from 'react'; // ✅ Include useState
import Axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap'; // ✅ Add missing Row and Col
import 'react-quill/dist/quill.snow.css';

function GamleIntro() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [gameintroText, setGameIntroText] = useState({ gameintro: '' });

  useEffect(() => {
    Axios.get(`${baseURL}/user/get-homepage-text.php`)
      .then((res) => {
        if (res.status === 200) {
          setGameIntroText(res.data);
        } else {
          console.warn('No homepage text found');
        }
      })
      .catch((err) => {
        console.error('Error fetching homepage text:', err);
      });
  }, [baseURL]);
  console.log(gameintroText.gameintro);
  return (
    <Container>
      <Row className='justify-content-center'>
        <Col md={6}>
          <div
            dangerouslySetInnerHTML={{ __html: gameintroText.gameintro }}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default GamleIntro;
