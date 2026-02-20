import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/style.css";
import "../css/flaticon.css";
import { checkAvailabilityClient } from "../services/client";

const Home = () => {
  const navigate = useNavigate();

  const heroSlides = useMemo(
    () => ["/src/images/hero-1.jpg", "/src/images/hero-2.jpg", "/src/images/hero-3.jpg"],
    []
  );

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  useEffect(() => {
  const interval = setInterval(() => {
    setActiveHeroIndex((i) => (i + 1) % heroSlides.length);
  }, 5000); // change every 5 seconds

  return () => clearInterval(interval);
}, [heroSlides.length]);

  const heroBg = heroSlides[activeHeroIndex];

  // availability form state
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [nbPersonnes, setNbPersonnes] = useState(2);
  const [typeChambre, setTypeChambre] = useState("SINGLE");

  const [loading, setLoading] = useState(false);
  const [availResult, setAvailResult] = useState(null);
  const [error, setError] = useState("");


  const onCheckAvailability = async (e) => {
    e.preventDefault();
    setError("");
    setAvailResult(null);

    if (!dateArrivee || !dateDepart) return setError("Please select check-in and check-out dates.");
    if (new Date(dateDepart) <= new Date(dateArrivee)) return setError("Check-out must be after check-in.");
    if (!nbPersonnes || Number(nbPersonnes) < 1) return setError("Guests must be at least 1.");

    try {
      setLoading(true);
      const data = await checkAvailabilityClient({
        dateArrivee,
        dateDepart,
        typeChambre,
        nbPersonnes: Number(nbPersonnes),
      });

      setAvailResult(data);

      if (!data?.disponible) {
        setError("No available room for the selected dates and room type.");
        return;
      }

      navigate("/booking-request", {
        state: {
          dateArrivee,
          dateDepart,
          nbPersonnes: Number(nbPersonnes),
          typeChambre,
          prixNuit: data?.prixNuit,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Server error while checking availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="hero-text">
                <h1>Your Stay in Morocco, Made Easy</h1>
                <p>
                  Enjoy a warm Moroccan welcome with comfortable rooms, reliable Wi-Fi, and a front desk available
                  24/7. Perfect for city trips, business stays, and weekend getaways.
                </p>
                <Link to="/rooms" className="primary-btn">
                  Discover Rooms
                </Link>
              </div>
            </div>

            {/* Booking form */}
            <div className="col-xl-4 col-lg-5 offset-xl-2 offset-lg-1">
              <div className="booking-form">
                <h3>Check Availability</h3>

                <form onSubmit={onCheckAvailability}>
                  <div className="check-date">
                    <label htmlFor="date-in">Check In:</label>
                    <input
                      type="date"
                      className="date-input"
                      id="date-in"
                      value={dateArrivee}
                      onChange={(e) => setDateArrivee(e.target.value)}
                    />
                    <i className="icon_calendar"></i>
                  </div>

                  <div className="check-date">
                    <label htmlFor="date-out">Check Out:</label>
                    <input
                      type="date"
                      className="date-input"
                      id="date-out"
                      value={dateDepart}
                      onChange={(e) => setDateDepart(e.target.value)}
                    />
                    <i className="icon_calendar"></i>
                  </div>

                  {/* Guests */}
                  <div className="select-option">
                    <label htmlFor="guest">Number of Guests:</label>
                    <input
                      id="guest"
                      type="number"
                      min="1"
                      className="date-input"
                      value={nbPersonnes}
                      onChange={(e) => setNbPersonnes(e.target.value)}
                      placeholder="Enter number of guests"
                    />
                  </div>

                  <div className="select-option">
                    <label htmlFor="roomType">Room Type:</label>
                    <select
                      id="roomType"
                      value={typeChambre}
                      onChange={(e) => setTypeChambre(e.target.value)}
                    >
                      <option value="SINGLE">SINGLE</option>
                      <option value="DOUBLE">DOUBLE</option>
                      <option value="TWIN">TWIN</option>
                      <option value="FAMILY">FAMILY</option>
                    </select>
                  </div>

                  <button type="submit" disabled={loading}>
                    {loading ? "Checking..." : "Check Availability"}
                  </button>

                  {error && <p style={{ marginTop: 12, color: "crimson", fontWeight: 600 }}>{error}</p>}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Background*/}
        <div className="hero-slider">
          <div
            className="hs-item"
            style={{
              backgroundImage: `url(${heroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>

      </section>

      {/* About Us */}
      <section className="aboutus-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="about-text">
                <div className="section-title">
                  <span>About Us</span>
                  <h2>
                    A Modern Moroccan Hotel <br /> With Local Charm
                  </h2>
                </div>

                <p className="f-para">
                  Located close to the city center, our hotel offers a calm and comfortable stay with easy access to
                  the medina, cafés, and local attractions. We focus on clean rooms, friendly service, and a smooth
                  guest experience.
                </p>

                <p className="s-para">
                  Whether you’re here for business or leisure, enjoy daily housekeeping, Wi-Fi, and helpful staff that
                  can guide you to beaches, restaurants, and must-see places nearby.
                </p>

                <Link to="/about" className="primary-btn about-btn">
                  Read More
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-pic">
                <div className="row">
                  <div className="col-sm-6">
                    <img src="/src/images/about/about-1.jpg" alt="about 1" />
                  </div>
                  <div className="col-sm-6">
                    <img src="/src/images/about/about-2.jpg" alt="about 2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>What We Offer</span>
                <h2>Hotel Services</h2>
              </div>
            </div>
          </div>

          <div className="row">
            {[
              {
                icon: "flaticon-033-dinner",
                title: "Moroccan Breakfast",
                text: "Start your day with fresh bread, local pastries, mint tea, coffee, and seasonal fruits (served daily).",
              },
              {
                icon: "flaticon-024-towel",
                title: "Daily Housekeeping",
                text: "Clean rooms, fresh towels, and toiletries refilled daily for a comfortable stay.",
              },
              {
                icon: "flaticon-044-clock-1",
                title: "Airport / City Transfers",
                text: "Private driver service available on request for airport pickup and local rides (extra charge).",
              },
            ].map((s, idx) => (
              <div className="col-lg-4 col-sm-6" key={idx}>
                <div className="service-item">
                  <i className={s.icon}></i>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Preview */}
      <section className="hp-room-section">
        <div className="container-fluid">
          <div className="hp-room-items">
            <div className="row">
              {[
                {
                  title: "Double Room",
                  price: "500 dh",
                  img: "/src/images/room/room-b1.jpg",
                  
                  capacity: "Max 2 guests",
                  bed: "1 Queen Bed",
                  services: "Wi-Fi, AC, TV, Private bathroom",
                },
                {
                  title: "Single Room",
                  price: "400 dh",
                  img: "/src/images/room/room-b2.jpg",
                  
                  capacity: "Max 1 guest",
                  bed: "1 Single Bed",
                  services: "Wi-Fi, AC, Desk, Private bathroom",
                },
                {
                  title: "Twin Room",
                  price: "600 dh",
                  img: "/src/images/room/room-b3.jpg",
                  
                  capacity: "Max 2 guests",
                  bed: "2 Single Beds",
                  services: "Wi-Fi, AC, TV, Private bathroom",
                },
                {
                  title: "Family Room",
                  price: "1000 dh",
                  img: "/src/images/room/room-b4.jpg",
                  
                  capacity: "Max 4 guests",
                  bed: "1 Queen Bed + 2 Single Beds",
                  services: "Wi-Fi, AC, TV, Family bathroom",
                },
              ].map((r, idx) => (
                <div className="col-lg-3 col-md-6" key={idx}>
                  <div
                    className="hp-room-item"
                    style={{
                      backgroundImage: `url(${r.img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <div className="hr-text">
                      <h3>{r.title}</h3>
                      <h2>
                        {r.price}
                        <span>/per night</span>
                      </h2>
                      <table>
                        <tbody>
                         
                          <tr>
                            <td className="r-o">Capacity:</td>
                            <td>{r.capacity}</td>
                          </tr>
                          <tr>
                            <td className="r-o">Bed:</td>
                            <td>{r.bed}</td>
                          </tr>
                          <tr>
                            <td className="r-o">Services:</td>
                            <td>{r.services}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
