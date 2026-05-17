import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Map as MapIcon, Layers, Users, CheckCircle, Clock } from 'lucide-react';
import { implementingEntities as entityDefaults } from '../data/dashboardData';
import { useData } from '../context/DataContext';
import './HealthMap.css';

export default function HealthMap() {
  const { entities } = useData();
  const [hoveredEntity, setHoveredEntity] = useState(null);

  // Live entity list (with coords baked in by the backend), falling back to static.
  const implementingEntities = (entities && entities.length)
    ? entities.filter(e => e.lat && e.lng).map(e => ({
        id: e.id,
        name: e.name,
        abbrev: e.abbrev,
        lat: e.lat,
        lng: e.lng,
        color: e.color,
        progress: e.progress,
        tasksCompleted: e.tasksCompleted,
        tasksTotal: e.tasksTotal,
        budget: e.budget,
        spent: e.spent,
      }))
    : entityDefaults;

  return (
    <section className="map-section" id="map-section">
      <div className="map-section__header">
        <div>
          <h2 className="map-section__title"><MapIcon size={20} className="map-section__title-icon" /> Implementing Entities Location</h2>
          <p className="map-section__subtitle">Location of all 10 implementing entities with implementation progress</p>
        </div>
      </div>

      {/* Entity Legend */}
      <div className="map-entity-chips">
        {implementingEntities.map(e => (
          <div key={e.id} className={`map-entity-chip ${hoveredEntity===e.id?'map-entity-chip--active':''}`} style={{'--ec':e.color}}
            onMouseEnter={()=>setHoveredEntity(e.id)} onMouseLeave={()=>setHoveredEntity(null)}>
            <span className="map-entity-chip__dot" style={{background:e.color}} />
            <span className="map-entity-chip__name">{e.abbrev}</span>
            <span className="map-entity-chip__pct">{e.progress}%</span>
          </div>
        ))}
      </div>

      <div className="map-wrapper">
        <MapContainer center={[8.46,-11.78]} zoom={7} style={{height:'100%',width:'100%'}} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {implementingEntities.map(entity => (
            <CircleMarker key={entity.id} center={[entity.lat,entity.lng]} radius={entity.progress > 80 ? 16 : entity.progress > 60 ? 14 : 12}
              pathOptions={{color:entity.color,fillColor:entity.color,fillOpacity:0.35,weight:2.5,opacity:0.9}}>
              <Popup className="map-popup">
                <div className="map-popup__content">
                  <h4 style={{color:entity.color,marginBottom:8,fontSize:'0.9rem'}}>{entity.abbrev}</h4>
                  <p style={{fontSize:'0.75rem',color:'#475569',marginBottom:12,lineHeight:1.4}}>{entity.name}</p>
                  <div className="map-popup__progress-bar">
                    <div className="map-popup__progress-fill" style={{width:`${entity.progress}%`,background:entity.color}} />
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                    <span style={{fontSize:'0.7rem',color:'#64748B'}}>Progress</span>
                    <span style={{fontSize:'0.7rem',fontWeight:700,color:entity.color}}>{entity.progress}%</span>
                  </div>
                  <div className="map-popup__stats">
                    <div className="map-popup__stat">
                      <CheckCircle size={13} color="#10B981" />
                      <span>{entity.tasksCompleted} Completed</span>
                    </div>
                    <div className="map-popup__stat">
                      <Clock size={13} color="#F59E0B" />
                      <span>{entity.tasksTotal - entity.tasksCompleted} Pending</span>
                    </div>
                  </div>
                  <div style={{fontSize:'0.68rem',color:'#94A3B8',marginTop:8,paddingTop:8,borderTop:'1px solid #E2E8F0'}}>
                    Budget: ${(entity.budget/1000).toFixed(0)}K · Spent: ${(entity.spent/1000).toFixed(0)}K
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Entity Summary Table */}
      <div className="map-entity-table">
        <table>
          <thead>
            <tr><th>Entity</th><th>Tasks</th><th>Completed</th><th>Progress</th><th>Budget</th><th>Spent</th></tr>
          </thead>
          <tbody>
            {implementingEntities.map(e => (
              <tr key={e.id}>
                <td><span className="map-entity-table__dot" style={{background:e.color}} />{e.abbrev}</td>
                <td>{e.tasksTotal}</td>
                <td>{e.tasksCompleted}</td>
                <td>
                  <div className="map-entity-table__bar"><div style={{width:`${e.progress}%`,background:e.color}} /></div>
                  <span className="map-entity-table__pct">{e.progress}%</span>
                </td>
                <td>${(e.budget/1000).toFixed(0)}K</td>
                <td>${(e.spent/1000).toFixed(0)}K</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
