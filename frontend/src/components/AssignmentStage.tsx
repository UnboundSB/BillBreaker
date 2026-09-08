interface AssignmentStageProps {
  onNext: () => void;
  onPrev: () => void;
}

export function AssignmentStage({ onNext, onPrev }: AssignmentStageProps) {
  return (
    <div className="card" style={{ maxWidth: '800px', width: '100%' }}>
      <h2>Stage 4: Assign Items</h2>
      <p>Who ate what? Assign each item to one or more people.</p>
      
      <div style={{ margin: '2rem 0', padding: '2rem', border: '1px solid var(--surface-color)', borderRadius: '12px' }}>
        <p>Interactive matching UI will go here.</p>
      </div>

      <div className="button-group">
        <button className="btn btn-accent" onClick={onPrev}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Calculate Split</button>
      </div>
    </div>
  );
}
