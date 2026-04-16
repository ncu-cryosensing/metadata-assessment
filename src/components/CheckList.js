const CheckList = ({ title, items, color }) => (
  <div style={{ borderLeft: `5px solid ${color}`, padding: '10px', margin: '10px 0' }}>
    <h4>{title} ({items.length})</h4>
    <ul>
      {items.map((check, index) => (
        <li key={index}>
          <strong>{check.level}</strong> – <em>{check.principle}</em>: {check.message}
        </li>
      ))}
    </ul>
  </div>
);

export default CheckList;
