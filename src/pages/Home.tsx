import Gallery from '../components/Gallery';
import Sidebar from '../components/bars/SideBar';
import { Col, Row } from 'react-bootstrap';

const items = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
];

const Home = () => {
    return (
        <>
            <Row>
                <Col md="auto">
                    <Sidebar />
                </Col>
                <Col>
                    <h1 className="mb-4">Organizations</h1>
                    <Gallery items={items} />
                </Col>
            </Row>
        </>
    );
};
export default Home;
