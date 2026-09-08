interface UploadStageProps {
  onNext: () => void;
}

export function UploadStage({ onNext }: UploadStageProps) {
  return (
    <div className="card">
      <h2>Stage 1: Upload Bill</h2>
      <p>Drag and drop your receipt here, or click to browse.</p>
      
      <div style={{ border: '2px dashed var(--primary-color)', padding: '3rem', borderRadius: '12px', margin: '2rem 0' }}>
        <p>File drop zone (Placeholder)</p>
      </div>

      <div className="button-group">
        <button className="btn btn-primary" onClick={onNext}>Upload & Parse</button>
      </div>
    </div>
  );
}
