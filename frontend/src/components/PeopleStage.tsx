interface PeopleStageProps {
  onNext: () => void;
  onPrev: () => void;
}

export function PeopleStage({ onNext, onPrev }: PeopleStageProps) {
  return (
    <div className="card">
      <h2>Stage 3: Add People</h2>
      <p>How many people are splitting this bill, and what are their names?</p>
      
      <div style={{ margin: '2rem 0' }}>
        <input 
          type="text" 
          placeholder="Person's Name" 
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--text-muted)', width: '80%' }} 
        />
        <button className="btn btn-accent" style={{ marginTop: '1rem' }}>Add Person</button>
      </div>

      <div className="button-group">
        <button className="btn btn-accent" onClick={onPrev}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Next: Assign Items</button>
      </div>
    </div>
  );
}
