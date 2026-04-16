const AssessmentSection = ({ title, value }) => (
  <div style={{ margin: '10px 0' }}>
    <strong>{title}</strong>: {value}% complete
    <div style={{ height: '10px', background: '#ccc', marginTop: '4px' }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        backgroundColor: '#4CAF50'
      }}></div>
    </div>
  </div>
);

export default AssessmentSection;
