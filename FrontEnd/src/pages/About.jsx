// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import "../css/style.css";

export default function About() {
  return (
    <div>
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>About Us</h2>
                <div className="bt-option">
                  <Link to="/">Home</Link>
                  <span>About Us</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="aboutus-page-section spad">
        <div className="container">
          <div className="about-page-text">
            <div className="row">
              <div className="col-lg-6">
                <div className="ap-title">
                  <h2>Welcome to Sona Morocco.</h2>
                  <p>
                    A modern Moroccan hotel designed for comfort and simplicity. We offer clean, quiet rooms,
                    friendly staff, and an easy stay whether you’re visiting for business, a city break, or a
                    weekend getaway. Our location gives you quick access to local cafés, the medina, and key
                    attractions.
                  </p>
                </div>
              </div>

              <div className="col-lg-5 offset-lg-1">
                <ul className="ap-services">
                  <li>
                    <i className="icon_check"></i> Free high-speed Wi-Fi in all rooms
                  </li>
                  <li>
                    <i className="icon_check"></i> Moroccan breakfast served daily
                  </li>
                  <li>
                    <i className="icon_check"></i> Daily housekeeping & fresh towels
                  </li>
                  <li>
                    <i className="icon_check"></i> 24/7 front desk support
                  </li>
                  <li>
                    <i className="icon_check"></i> Airport / city transfer on request
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="about-page-services">
            <div className="row">
              <div className="col-md-4">
                <div
                  className="ap-service-item"
                  style={{
                    backgroundImage: "url(/src/images/about/about-p1.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="api-text">
                    <h3>Breakfast & Tea</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className="ap-service-item"
                  style={{
                    backgroundImage: "url(/src/images/about/about-p2.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="api-text">
                    <h3>City Experiences</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className="ap-service-item"
                  style={{
                    backgroundImage: "url(/src/images/about/about-p3.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="api-text">
                    <h3>Events & Meetings</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </section>
    </div>
  );
}
