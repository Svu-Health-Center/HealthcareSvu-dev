import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="footer bg-light mt-auto py-3">
            <Container className="text-center">
                <span className="text-muted">
                    © {new Date().getFullYear()} Sri Venkateswara University Health Center. All Rights Reserved.
                </span>
            </Container>
        </footer>
    );
};

export default Footer;