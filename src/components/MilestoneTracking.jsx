import { useState } from 'react';
import MilestoneEntityView from './MilestoneEntityView';
import MilestoneObjectiveView from './MilestoneObjectiveView';
import { Network, Target } from 'lucide-react';
import './MilestoneTracking.css';

export default function MilestoneTracking() {
  const [viewMode, setViewMode] = useState('entity'); // 'entity' | 'objective'

  return (
    <div className="ms-wrapper">
      <div className="ms-view-toggle">
        <button 
          className={`ms-toggle-btn ${viewMode === 'entity' ? 'ms-toggle-btn--active' : ''}`}
          onClick={() => setViewMode('entity')}
        >
          <Network size={16} />
          Entity Deep Dive
        </button>
        <button 
          className={`ms-toggle-btn ${viewMode === 'objective' ? 'ms-toggle-btn--active' : ''}`}
          onClick={() => setViewMode('objective')}
        >
          <Target size={16} />
          Objective Deep Dive
        </button>
      </div>

      {viewMode === 'entity' ? <MilestoneEntityView /> : <MilestoneObjectiveView />}
    </div>
  );
}
