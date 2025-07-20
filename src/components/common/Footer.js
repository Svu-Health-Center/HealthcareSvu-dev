import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="footer bg-light mt-auto py-3 border-top">
      <Container className="text-center">
        <span className="text-muted d-block">
          &copy; Sri Venkateswara University. All rights reserved.
        </span>
        <span className="text-muted d-block">
          This application is developed for the Health Center affiliated with
          Sri Venkateswara University.
        </span>
        <span className="text-muted d-block">Developed by Susheel Kumar</span>
      </Container>
    </footer>
  );
};

export default Footer;
