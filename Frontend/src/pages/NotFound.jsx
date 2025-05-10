import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import '../styles/not-found.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-description">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary not-found-button">
          <FiArrowLeft className="button-icon" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 