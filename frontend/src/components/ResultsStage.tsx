interface ResultsStageProps {
  onPrev: () => void;
}

export function ResultsStage({ onPrev }: ResultsStageProps) {
  return (
    <div className="card">
      <h2>Stage 5: Final Split</h2>
      <p>Here is what everyone owes.</p>
      
      <div style={{ margin: '2rem 0', textAlign: 'left' }}>
        <h3>Summary:</h3>
        <ul>
          <li>Alice owes $15.00</li>
          <li>Bob owes $13.00</li>
        </ul>
      </div>

      <div className="button-group">
        <button className="btn btn-accent" onClick={onPrev}>Back</button>
        <button className="btn btn-primary">Download PDF</button>
      </div>
    </div>
  );
}
