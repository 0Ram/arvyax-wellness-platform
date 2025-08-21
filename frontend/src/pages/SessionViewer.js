import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const SessionViewer = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // ✅ No Authorization header for public sessions
        const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Session not found');
        }

        const session = await response.json();
        setSessionData(session);

        // ✅ Fetch JSON content from URL if available
        if (session.json_file_url) {
          const jsonResponse = await fetch(session.json_file_url);
          const jsonContent = await jsonResponse.json();
          setJsonData(jsonContent);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        toast.error('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]); // Only depends on sessionId

  if (loading) {
    return (
      <div className="session-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!sessionData || !jsonData) {
    return (
      <div className="session-viewer-error">
        <h2>Session Not Found</h2>
        <p>The session you're looking for doesn't exist or couldn't be loaded.</p>
      </div>
    );
  }

  return (
    <div className="session-viewer">
      <div className="session-header">
        <h1>{jsonData.session_info?.title || sessionData.title}</h1>
        <div className="session-meta">
          <span className="duration">⏱️ {jsonData.session_info?.duration}</span>
          <span className="difficulty">📊 {jsonData.session_info?.difficulty}</span>
          <span className="status">
            {sessionData.status === 'published' ? '✅ Published' : '📝 Draft'}
          </span>
        </div>
      </div>

      {jsonData.session_info?.description && (
        <div className="session-description">
          <p>{jsonData.session_info.description}</p>
        </div>
      )}

      {jsonData.session_info?.equipment && (
        <div className="session-equipment">
          <h3>🎒 Equipment Needed</h3>
          <ul>
            {jsonData.session_info.equipment.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preparation Section */}
      {jsonData.preparation && (
        <div className="session-section">
          <h2>🧘 Preparation</h2>
          <div className="preparation-details">
            {jsonData.preparation.posture && (
              <div className="prep-item">
                <strong>Posture:</strong> {jsonData.preparation.posture}
              </div>
            )}
            {jsonData.preparation.hand_position && (
              <div className="prep-item">
                <strong>Hand Position:</strong> {jsonData.preparation.hand_position}
              </div>
            )}
            {jsonData.preparation.eyes && (
              <div className="prep-item">
                <strong>Eyes:</strong> {jsonData.preparation.eyes}
              </div>
            )}
            {jsonData.preparation.cautions && (
              <div className="prep-item">
                <strong>⚠️ Safety Notes:</strong>
                <ul>
                  {jsonData.preparation.cautions.map((caution, index) => (
                    <li key={index}>{caution}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warm-up Section */}
      {jsonData.warm_up && (
        <div className="session-section">
          <h2>🔥 Warm-up ({jsonData.warm_up.duration})</h2>
          <p className="section-instructions">{jsonData.warm_up.instructions}</p>
          {jsonData.warm_up.poses && (
            <div className="poses-grid">
              {jsonData.warm_up.poses.map((pose, index) => (
                <div key={index} className="pose-card">
                  <h4>{pose.name}</h4>
                  <div className="pose-duration">⏱️ {pose.duration}</div>
                  <p className="pose-instructions">{pose.instructions}</p>
                  {pose.breathing && (
                    <div className="breathing-cue">💨 {pose.breathing}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {jsonData.warm_up.exercises && (
            <div className="exercises-grid">
              {jsonData.warm_up.exercises.map((exercise, index) => (
                <div key={index} className="exercise-card">
                  <h4>{exercise.name}</h4>
                  <div className="exercise-duration">⏱️ {exercise.duration}</div>
                  <p className="exercise-instructions">{exercise.instructions}</p>
                  {exercise.intensity && (
                    <div className="intensity">📊 Intensity: {exercise.intensity}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Flow/Techniques Section */}
      {jsonData.main_flow && (
        <div className="session-section">
          <h2>💪 Main Flow ({jsonData.main_flow.duration})</h2>
          {jsonData.main_flow.rounds && (
            <div className="flow-info">
              <span>🔄 {jsonData.main_flow.rounds} rounds</span>
            </div>
          )}
          {jsonData.main_flow.poses && (
            <div className="poses-grid">
              {jsonData.main_flow.poses.map((pose, index) => (
                <div key={index} className="pose-card">
                  <h4>{pose.name}</h4>
                  <div className="pose-duration">⏱️ {pose.duration}</div>
                  <p className="pose-instructions">{pose.instructions}</p>
                  {pose.breathing && (
                    <div className="breathing-cue">💨 {pose.breathing}</div>
                  )}
                  {pose.benefits && (
                    <div className="benefits">✨ {pose.benefits}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Techniques Section (for breathwork/meditation) */}
      {jsonData.techniques && (
        <div className="session-section">
          <h2>🌬️ Breathing Techniques</h2>
          <div className="techniques-list">
            {jsonData.techniques.map((technique, index) => (
              <div key={index} className="technique-card">
                <h3>{technique.name}</h3>
                <div className="technique-meta">
                  <span className="duration">⏱️ {technique.duration}</span>
                  {technique.rounds && <span className="rounds">🔄 {technique.rounds} rounds</span>}
                </div>
                <div className="technique-instructions">
                  <h4>Instructions:</h4>
                  <ol>
                    {technique.instructions.map((instruction, i) => (
                      <li key={i}>{instruction}</li>
                    ))}
                  </ol>
                </div>
                {technique.benefits && (
                  <div className="benefits">
                    <strong>✨ Benefits:</strong> {technique.benefits}
                  </div>
                )}
                {technique.modifications && (
                  <div className="modifications">
                    <strong>🔧 Modifications:</strong> {technique.modifications}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phases Section (for meditation) */}
      {jsonData.phases && (
        <div className="session-section">
          <h2>🧠 Meditation Phases</h2>
          <div className="phases-list">
            {jsonData.phases.map((phase, index) => (
              <div key={index} className="phase-card">
                <h3>{phase.phase}</h3>
                <div className="phase-duration">⏱️ {phase.duration}</div>
                <div className="phase-instructions">
                  {Array.isArray(phase.instructions) ? (
                    <ul>
                      {phase.instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{phase.instructions}</p>
                  )}
                </div>
                {phase.guidance && (
                  <div className="guidance">
                    <strong>💡 Guidance:</strong> {phase.guidance}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Workout Section (for fitness) */}
      {jsonData.main_workout && (
        <div className="session-section">
          <h2>💪 Main Workout ({jsonData.main_workout.duration})</h2>
          <div className="workout-structure">
            <span className="work-time">⚡ Work: {jsonData.main_workout.work_time}</span>
            <span className="rest-time">😌 Rest: {jsonData.main_workout.rest_time}</span>
          </div>
          <div className="exercises-grid">
            {jsonData.main_workout.exercises.map((exercise, index) => (
              <div key={index} className="exercise-card">
                <h4>{exercise.name}</h4>
                <p className="exercise-instructions">{exercise.instructions}</p>
                {exercise.target && (
                  <div className="target-muscles">🎯 Targets: {exercise.target}</div>
                )}
                {exercise.modifications && (
                  <div className="modifications">🔧 {exercise.modifications}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cool-down Section */}
      {jsonData.cool_down && (
        <div className="session-section">
          <h2>🌙 Cool-down ({jsonData.cool_down.duration})</h2>
          {jsonData.cool_down.poses && (
            <div className="poses-grid">
              {jsonData.cool_down.poses.map((pose, index) => (
                <div key={index} className="pose-card">
                  <h4>{pose.name}</h4>
                  <div className="pose-duration">⏱️ {pose.duration}</div>
                  <p className="pose-instructions">{pose.instructions}</p>
                  {pose.breathing && (
                    <div className="breathing-cue">💨 {pose.breathing}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {jsonData.cool_down.exercises && (
            <div className="exercises-grid">
              {jsonData.cool_down.exercises.map((exercise, index) => (
                <div key={index} className="exercise-card">
                  <h4>{exercise.name}</h4>
                  <div className="exercise-duration">⏱️ {exercise.duration}</div>
                  <p className="exercise-instructions">{exercise.instructions}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Integration Section */}
      {jsonData.integration && (
        <div className="session-section">
          <h2>🌟 Integration ({jsonData.integration.duration})</h2>
          <div className="integration-instructions">
            {Array.isArray(jsonData.integration.instructions) ? (
              <ul>
                {jsonData.integration.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ul>
            ) : (
              <p>{jsonData.integration.instructions}</p>
            )}
          </div>
        </div>
      )}

      {/* Daily Tips */}
      {jsonData.daily_tips && (
        <div className="session-section">
          <h2>💡 Daily Tips</h2>
          <ul className="tips-list">
            {jsonData.daily_tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Affirmation */}
      {jsonData.affirmation && (
        <div className="session-affirmation">
          <h3>✨ Session Affirmation</h3>
          <p className="affirmation-text">"{jsonData.affirmation}"</p>
        </div>
      )}

      {/* Session Tags */}
      {sessionData.tags && sessionData.tags.length > 0 && (
        <div className="session-tags">
          <h3>🏷️ Tags</h3>
          <div className="tags-container">
            {sessionData.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionViewer;