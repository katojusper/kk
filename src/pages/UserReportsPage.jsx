import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiUser,
  FiPackage,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMapPin,
  FiCalendar,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  submitCrimeReport,
  getMyCrimeReports,
  getUserNotifications,
} from '../services/reportingApi';

export function UserReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('submit');
  const [myReports, setMyReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    date: '',
    description: '',
    category: 'theft',
    file: null,
  });

  useEffect(() => {
    if (activeTab === 'my-reports') {
      loadMyReports();
    }
  }, [activeTab]);

  const loadMyReports = async () => {
    try {
      setLoading(true);
      const [reports, notifs] = await Promise.all([
        getMyCrimeReports(),
        getUserNotifications(10),
      ]);
      setMyReports(reports);
      setNotifications(notifs);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.location || !formData.date || !formData.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await submitCrimeReport(formData);
      showToast('Report submitted successfully!');

      // Reset form
      setFormData({
        type: '',
        location: '',
        date: '',
        description: '',
        category: 'theft',
        file: null,
      });

      // Switch to my reports tab
      setActiveTab('my-reports');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, file });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <FiCheckCircle color="#27ae60" size={20} />;
      case 'pending':
        return <FiClock color="#f39c12" size={20} />;
      case 'rejected':
        return <FiXCircle color="#e74c3c" size={20} />;
      default:
        return <FiAlertTriangle color="#95a5a6" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#27ae60';
      case 'pending':
        return '#f39c12';
      case 'rejected':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '15px 25px',
          borderRadius: '8px',
          background: toast.type === 'success' ? '#27ae60' : '#e74c3c',
          color: 'white',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            color: '#1a1a2e',
            fontSize: '32px',
            fontWeight: '700',
          }}>
            Report Crime
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            Submit and track your crime reports securely and anonymously
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
        }}>
          <button
            onClick={() => setActiveTab('submit')}
            style={{
              flex: 1,
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'submit' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'submit' ? '#667eea' : 'white',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
            }}
          >
            <FiFileText />
            Submit Report
          </button>
          <button
            onClick={() => setActiveTab('my-reports')}
            style={{
              flex: 1,
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'my-reports' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'my-reports' ? '#667eea' : 'white',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
            }}
          >
            <FiAlertTriangle />
            My Reports ({myReports.length})
          </button>
        </div>

        {/* Submit Report Form */}
        {activeTab === 'submit' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                }}>
                  Crime Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Theft, Assault, Vandalism"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                }}>
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="theft">Theft</option>
                  <option value="assault">Assault</option>
                  <option value="vandalism">Vandalism</option>
                  <option value="fraud">Fraud</option>
                  <option value="burglary">Burglary</option>
                  <option value="robbery">Robbery</option>
                  <option value="cybercrime">Cybercrime</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                }}>
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where did this occur?"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                }}>
                  Date of Incident *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                }}>
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed description of what happened..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                }}>
                  Evidence (Photo/Video)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                  }}
                />
                {formData.file && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    background: '#f0f0f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}>
                    Selected: {formData.file.name}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '8px',
                  border: 'none',
                  background: submitting ? '#95a5a6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        )}

        {/* My Reports */}
        {activeTab === 'my-reports' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{ margin: 0, color: '#1a1a2e' }}>My Reports</h2>
              <button
                onClick={loadMyReports}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f0f0f0',
                  color: '#666',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                }}
              >
                <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                Loading reports...
              </div>
            ) : myReports.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                <FiAlertTriangle size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
                <p>No reports yet. Submit your first report to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {myReports.map((report) => (
                  <div
                    key={report.id}
                    style={{
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '10px',
                    }}>
                      <div>
                        <h3 style={{
                          margin: '0 0 5px 0',
                          color: '#1a1a2e',
                          fontSize: '18px',
                          fontWeight: '600',
                        }}>
                          {report.type}
                        </h3>
                        <div style={{
                          display: 'flex',
                          gap: '15px',
                          fontSize: '14px',
                          color: '#666',
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FiMapPin size={14} />
                            {report.location}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FiCalendar size={14} />
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        background: `${getStatusColor(report.status)}20`,
                        color: getStatusColor(report.status),
                        fontWeight: '600',
                        fontSize: '14px',
                      }}>
                        {getStatusIcon(report.status)}
                        {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                      </div>
                    </div>
                    <p style={{
                      margin: '10px 0 0 0',
                      color: '#666',
                      fontSize: '14px',
                      lineHeight: '1.5',
                    }}>
                      {report.description}
                    </p>
                    {report.admin_notes && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}>
                        <strong>Admin Notes:</strong> {report.admin_notes}
                      </div>
                    )}
                    <div style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#999',
                    }}>
                      Submitted on {new Date(report.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
