import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from '../common/Header';
import Footer from '../common/Footer';

const DashboardLayout = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
                <Container className="mt-4">
                    <Outlet /> {/* This renders the matched child route's component */}
                </Container>
            </main>
            <Footer />
        </div>
    );
};

export default DashboardLayout;