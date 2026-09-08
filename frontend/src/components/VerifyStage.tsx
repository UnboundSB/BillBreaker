interface VerifyStageProps {
  onNext: () => void;
  onPrev: () => void;
}

export function VerifyStage({ onNext, onPrev }: VerifyStageProps) {
  return (
    <div className="card" style={{ maxWidth: '800px', width: '100%' }}>
      <h2>Stage 2: Verify Bill</h2>
      <p>Review the parsed items to make sure they match the receipt.</p>
      
      <div style={{ backgroundColor: 'var(--accent-color)', color: '#1a1a1c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <strong>⚠️ Alert:</strong> Do these items total correctly to the final bill amount? (Validation logic goes here)
      </div>

      <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <ul>
          <li>Item 1 - $10.00</li>
          <li>Item 2 - $15.50</li>
          <li>Tax - $2.50</li>
        </ul>
      </div>

      <div className="button-group">
        <button className="btn btn-accent" onClick={onPrev}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Looks Good</button>
      </div>
    </div>
  );
}
