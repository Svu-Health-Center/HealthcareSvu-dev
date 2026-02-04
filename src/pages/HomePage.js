import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import Footer from "../components/common/Footer";
import "./HomePage.css";

const HomePage = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="home-wrapper">


            {/* Main Navigation */}
            <Navbar bg="white" expand="lg" className="main-navbar">
                <Container>
                    <Link to="/" className="brand-wrapper">
                        <img
                            src="/SVU.png"
                            alt="SVU Logo"
                            className="brand-logo"
                            style={{ height: '50px', marginRight: '15px' }}
                        />
                        <div className="d-flex flex-column brand-text">
                            <h4>SVU MEDICARE</h4>
                            <span>Sri Venkateswara University, Tirupati</span>
                        </div>
                    </Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav className="nav-menu">
                            <Nav.Link as={Link} to="/" className="nav-link-custom active">Home</Nav.Link>
                            <Nav.Link href="#about" className="nav-link-custom">About Us</Nav.Link>
                            <Nav.Link href="#services" className="nav-link-custom">Facilities</Nav.Link>
                            <Nav.Link href="#contact" className="nav-link-custom">Contact</Nav.Link>
                            {user ? (
                                <Link to={`/${user.role.toLowerCase()}`} className="btn-login-custom">
                                    <i className="bi bi-speedometer2 me-2"></i>Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="btn-login-custom">
                                    <i className="bi bi-person-lock me-2"></i>Staff Login
                                </Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <section className="hero-slider">
                <Container>
                    <div className="hero-content">
                        <h1 className="animate__animated animate__fadeInDown">Dedicated to Your Well-being</h1>
                        <p className="animate__animated animate__fadeInUp">
                            A Service Oriented Mini-Hospital providing comprehensive healthcare to the University Community since 1963.
                        </p>
                        <div className="hero-buttons animate__animated animate__fadeInUp">
                            <Link to="/public-registration" className="btn-hero btn-hero-primary">
                                <i className="bi bi-clipboard-plus me-2"></i> New Patient Registration
                            </Link>
                            <a href="#services" className="btn-hero btn-hero-secondary">
                                Explore Services
                            </a>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Stats Section */}
            <Container>
                <div className="stats-section">
                    <Row>
                        <Col md={3} className="stat-item">
                            <div className="stat-number">1963</div>
                            <div className="stat-label">Established</div>
                        </Col>
                        <Col md={3} className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Ambulance Service</div>
                        </Col>
                        <Col md={3} className="stat-item">
                            <div className="stat-number">20k+</div>
                            <div className="stat-label">Beneficiaries</div>
                        </Col>
                        <Col md={3} className="stat-item">
                            <div className="stat-number">300+</div>
                            <div className="stat-label">Daily Outpatients</div>
                        </Col>
                    </Row>
                </div>
            </Container>

            {/* About Section */}
            <section id="about" className="section-wrapper">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <div className="about-img-box">
                                <img
                                    src="/health-center.png"
                                    className="img-fluid"
                                    alt="Health Center"
                                    onError={(e) => { e.target.src = "https://placehold.co/600x400?text=SVU+Health+Center" }}
                                />
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="section-head text-start mb-4">
                                <h2>About Our Center</h2>
                            </div>
                            <div className="about-text">
                                <p>
                                    Sri Venkateswara University Health Centre was established in 1963. It is a service-oriented mini-hospital extending free medical service to:
                                </p>
                                <ul className="mb-3">
                                    <li>Students</li>
                                    <li>Research Scholars</li>
                                    <li>Employees of S.V. University and their dependent family members</li>
                                    <li>Retired employees and their spouses</li>
                                    <li>Guests and visitors to the University</li>
                                </ul>
                                <p>
                                    The total population covered is about 20,000. The average daily outpatient strength of the centre is about 300. The Centre has one Senior Medical Officer, one Lady Junior Medical Officer, and two Junior Medical Officers, who are assisted by paramedical staff members. Specialist consultancy services in General Medicine, General Surgery, Dental Surgery, and Ophthalmology drawn from the specialists of S.V.R.R. Government General Hospital, Tirupati are available at the Health Centre on specified days.
                                </p>
                                <p>
                                    The Centre renders Outpatient treatment, Inpatient treatment with 12 beds, Minor surgical procedures, Antenatal Check-ups and postnatal care, Immunization, Annual Medical check-ups for students, and call duty services. The centre also has a Clinical laboratory and Bio-chemical laboratory, X-Rays, Dental X-Ray, E.C.G etc., for diagnostic purposes, besides an Ambulance Van for the transport of the patients. It has proposals to acquire diagnostic equipment like Ultrasound Scanner and Upper gastro-intestinal endoscope.
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Services Section */}
            <section id="services" className="section-wrapper bg-light">
                <Container>
                    <div className="section-head">
                        <h2>Our Facilities & Services</h2>
                        <p className="text-muted">Comprehensive medical care under one roof</p>
                    </div>
                    <Row className="g-4">
                        <Col md={4} sm={6}>
                            <div className="service-card text-center">
                                <div className="service-icon mx-auto">
                                    <i className="bi bi-hospital"></i>
                                </div>
                                <h4>Outpatient & Inpatient</h4>
                                <p className="text-muted">Daily OP consultation and 12-bed inpatient facility for observation and treatment.</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="service-card text-center">
                                <div className="service-icon mx-auto">
                                    <i className="bi bi-heart-pulse"></i>
                                </div>
                                <h4>Emergency Care</h4>
                                <p className="text-muted">Immediate medical attention for casualties and ambulance services for referrals.</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="service-card text-center">
                                <div className="service-icon mx-auto">
                                    <i className="bi bi-capsule"></i>
                                </div>
                                <h4>Pharmacy</h4>
                                <p className="text-muted">In-house pharmacy dispenses prescribed medicines to patients free of cost.</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="service-card text-center">
                                <div className="service-icon mx-auto">
                                    <i className="bi bi-eyedropper"></i>
                                </div>
                                <h4>Pathology Lab</h4>
                                <p className="text-muted">Clinical laboratory for blood tests, urine analysis, and biochemical investigations.</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="service-card text-center">
                                <div className="service-icon mx-auto">
                                    <i className="bi bi-gender-female"></i>
                                </div>
                                <h4>Women's Health</h4>
                                <p className="text-muted">Antenatal checkups, postnatal care, and specialized gynecological consultations.</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="service-card text-center">
                                <div className="service-icon mx-auto">
                                    <i className="bi bi-stars"></i>
                                </div>
                                <h4>Specialist Visits</h4>
                                <p className="text-muted">Weekly visits by Ophthalmologists, Dermatologists, and Dental Surgeons.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>



            {/* Footer */}
            <footer className="main-footer" id="contact">
                <Container>
                    <Row>
                        <Col lg={4} md={6} className="mb-4">
                            <div className="footer-widget">
                                <h5 className="text-white">Contact Us</h5>
                                <ul className="list-unstyled footer-links">
                                    <li><i className="bi bi-geo-alt me-2"></i> SVU Health Center, Tirupati - 517502</li>
                                    <li><i className="bi bi-envelope me-2"></i> healthcentre@svumail.edu.in</li>
                                </ul>
                            </div>
                        </Col>
                        <Col lg={4} md={6} className="mb-4">
                            <div className="footer-widget">
                                <h5 className="text-white">Quick Links</h5>
                                <ul className="list-unstyled footer-links">
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/public-registration">New Registration</Link></li>
                                    <li><Link to="/login">Staff Login</Link></li>
                                    <li><a href="https://svuniversity.edu.in">SV University Main Site</a></li>
                                </ul>
                            </div>
                        </Col>
                        <Col lg={4} md={6} className="mb-4">
                            <div className="footer-widget">
                                <h5 className="text-white">Working Hours</h5>
                                <p>Monday - Saturday: <br /> 8:00 AM - 12:00 PM & 4:00 PM - 6:00 PM</p>
                                <p>Sunday: Emergency Services Only</p>
                            </div>
                        </Col>
                    </Row>
                    <div className="footer-bottom">
                        <Footer theme="dark" />
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default HomePage;
