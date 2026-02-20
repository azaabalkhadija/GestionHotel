// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../css/style.css";

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-text">
          <div className="row">
            <div className="col-lg-4">
              <div className="ft-about">
                <div className="logo">
                  <Link to="/">
                    <img
                      src="/src/images/footer-logo.png"
                      alt="footer logo"
                    />
                  </Link>
                </div>
                <p>Bringing Confort To your Holidays.</p>
              </div>
            </div>

            <div className="col-lg-3 offset-lg-1">
              <div className="ft-contact">
                <h6>Contact Us</h6>
                <ul>
                  <li>(+212) 5 39 00 00 00</li>
                  <li>contact@hotel-morocco.ma</li>
                  <li>Tetouan, Morocco</li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 offset-lg-1">
              <div className="ft-newslatter">
                <h6>Newsletter</h6>
                <p>Get the latest updates and offers.</p>
                <form className="fn-form" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Email" />
                  
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="copyright-option">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <ul>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
                <li>
                  <Link to="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link to="/policy">Policy</Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-5">
              <div className="co-text">
                <p>
                  Copyright &copy; {new Date().getFullYear()} All rights
                  reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
