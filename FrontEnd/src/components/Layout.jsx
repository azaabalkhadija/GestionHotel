
import '../css/Layout.css'; // Ensure you create and style this CSS file
import Aside from '../components/Aside';

const Layout = ({ children }) => {
  return (
    <div className="layout">
     
      <div className="main-content-layout">
        <Aside />
        <div className="body-content-layout">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout; 