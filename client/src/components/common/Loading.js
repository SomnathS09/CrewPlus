import './Loading.css';

const Loading = ({ size = 'medium', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div className={`loading-spinner ${size}`}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${size}`}></div>
    </div>
  );
};

export default Loading;
