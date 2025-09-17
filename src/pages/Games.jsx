import { Container, Row, Col, Button} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

function Games() {
    const navigate = useNavigate();

    const handleNavigation = (link) => {
        navigate(`/${link}`);
    };
  return (
    <Container>
        <Row className='justify-content-center'>
            <Col md={6}>
                <Row>
                    <Col className="text-center py-1" md={4} s={12}>
                        <Button className="btn-lg w-100" onClick={() => handleNavigation('wordle')}>Wordle</Button>
                    </Col>
                    <Col className="text-center py-1" md={4} s={12}>
                        <Button className="btn-lg w-100" onClick={() => handleNavigation('connections')}>Connections</Button>
                    </Col>
                    <Col className="text-center py-1 " md={4} s={12}>
                        <Button className="btn-lg w-100" onClick={() => handleNavigation('phrazle')}>Phrazle</Button>
                    </Col>
                    <Col className="text-center py-1 " md={4} s={12}>
                        <Button className="btn-lg w-100" onClick={() => handleNavigation('quordle')}>Quordle</Button>
                    </Col>
                </Row>
            </Col>
        </Row>
    </Container>
    
  )
}

export default Games