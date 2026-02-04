import React from "react";
import { Container } from "react-bootstrap";

const Footer = ({ theme = "light" }) => {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-transparent" : "bg-light"; // Homepage handles its own background
  const textClass = isDark ? "text-white-50" : "text-muted";

  return (
    <footer className={`footer ${bgClass} mt-auto py-3 ${isDark ? "" : "border-top"}`}>
      <Container className="text-center">
        <p className={`mb-1 ${textClass}`}>
          &copy;2025-{new Date().getFullYear()} Sri Venkateswara University. All rights reserved.
        </p>
        <p className={`mb-2 small ${textClass}`}>
          This application is developed for the Health Center affiliated with Sri Venkateswara University.
        </p>
        {isDark && <hr className="w-25 mx-auto border-secondary my-3" />}
        <p className={`mb-0 small ${textClass}`}>
          Developed by <strong>Malepati Susheel Kumar</strong>, Dept. of CSE, SVUCE <br />
          Batch: 2022–2026 | Roll No: 12206036
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
