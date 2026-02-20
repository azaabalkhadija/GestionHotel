import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import "../css/style.css";

export default function Contact() {
  return (
    <div>
      <div className="breadcrumb-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-text">
                <h2>Contact</h2>
                <div className="bt-option">
                  <Link to="/">Home</Link>
                  <span>Contact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="contact-section spad contact-plain">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-10">

              <div className="contact-tablewrap contact-tablewrap--plain">
                <table className="contact-table">
                  <tbody>
                    <tr>
                      <td className="c-o">Address:</td>
                      <td>City Center, Avenue Mohammed V, Tetouan, Morocco</td>
                    </tr>
                    <tr>
                      <td className="c-o">Phone:</td>
                      <td>(+212) 5 39 00 00 00</td>
                    </tr>
                    <tr>
                      <td className="c-o">Email:</td>
                      <td>contact@hotel-morocco.ma</td>
                    </tr>
                    <tr>
                      <td className="c-o">Hours:</td>
                      <td>Front Desk 24/7 — Check-in 2:00 PM — Check-out 12:00 PM</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
