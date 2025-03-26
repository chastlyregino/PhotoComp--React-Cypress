import Container from 'react-bootstrap/Container';
import Gallery from './Gallery';

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
        <Container>
            <h1 className="mb-4">Organizations</h1>
            <Gallery items={items} />
        </Container>
    );
};
export default Home;
