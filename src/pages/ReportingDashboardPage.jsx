import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiUser,
  FiPackage,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiEye,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import {
  submitCrimeReport,
  submitMissingPersonReport,
  submitMissingPropertyReport,
  submitGeneralReport,
  getMyCrimeReports,
  getReportingStatistics,
  getUserNotifications,
} from '../services/reportingApi';

export function ReportingDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [reportType, setReportType] = useState('crime');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Form states
  const [crimeForm, setCrimeForm] = useState({
    type: '',
    location: '',
    date: '',
    description: '',
    category: 'theft',
    file: null,
    latitude: null,
    longitude: null,
  });

  const [missingPersonForm, setMissingPersonForm] = useState({
    name: '',
    age: '',
    gender: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    description: '',
    contactInfo: '',
    photo: null,
    height: '',
    weight: '',
  });

  const [missingPropertyForm, setMissingPropertyForm] = useState({
    itemName: '',
    category: 'electronics',
    lastSeenLocation: '',
    dateLost: '',
    description: '',
    photo: null,
    serialNumber: '',
    estimatedValue: '',
  });

  const [generalForm, setGeneralForm] = useState({
    title: '',
    description: '',
    category: 'general',
    files: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, statsData, notifData] = await Promise.all([
        getMyCrimeReports(),
        getReportingStatistics(),
        getUserNotifications(10),
      ]);
      setMyReports(reportsData);
      setStatistics(statsData);
      setNotifications(notifData);
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

  const handleCrimeSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await submitCrimeReport(crimeForm);
      showToast('Crime report submitted successfully!');
      setCrimeForm({
        type: '',
        location: '',
        date: '',
        description: '',
        category: 'theft',
        file: null,
        latitude: null,
        longitude: null,
      });
      await loadData();
      setActiveTab('my-reports');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMissingPersonSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await submitMissingPersonReport(missingPersonForm);
      showToast('Missing person report submitted successfully!');
      setMissingPersonForm({
        name: '',
        age: '',
        gender: '',
        lastSeenLocation: '',
        lastSeenDate: '',
        description: '',
        contactInfo: '',
        photo: null,
        height: '',
        weight: '',
      });
      await loadData();
      setActiveTab('my-reports');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMissingPropertySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await submitMissingPropertyReport(missingPropertyForm);
      showToast('Missing property report submitted successfully!');
      setMissingPropertyForm({
        itemName: '',
        category: 'electronics',
        lastSeenLocation: '',
        dateLost: '',
        description: '',
        photo: null,
        serialNumber: '',
        estimatedValue: '',
      });
      await loadData();
      setActiveTab('my-reports');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await submitGeneralReport(generalForm);
      showToast('Report submitted successfully!');
      setGeneralForm({
        title: '',
        description: '',
        category: 'general',
        files: [],
      });
      await loadData();
      setActiveTab('my-reports');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderOverview = () => (
    <div style={{ padding: '30px' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Reporting Dashboard</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Submit and track your reports. Select a report type to get started.
      </p>

      {/* Statistics Cards */}
      {statistics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          <StatCard
            icon={FiAlertTriangle}
            title="Crime Reports"
            value={statistics.totalCrimeReports}
            subtitle={`${statistics.pendingCrimeReports} pending`}
            color="#e74c3c"
          />
          <StatCard
            icon={FiUser}
            title="Missing Persons"
            value={statistics.totalMissingPersons}
            subtitle={`${statistics.activeMissingPersons} active`}
            color="#f39c12"
          />
          <StatCard
            icon={FiPackage}
            title="Missing Property"
            value={statistics.totalMissingProperty}
            subtitle="Total reports"
            color="#3498db"
          />
          <StatCard
            icon={FiFileText}
            title="General Reports"
            value={statistics.totalGeneralReports}
            subtitle="All submissions"
            color="#9b59b6"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#1a1a2e' }}>Quick Actions</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
        }}>
          <ActionButton
            icon={FiAlertTriangle}
            title="Report Crime"
            description="Report criminal activity"
            onClick={() => setActiveTab('submit')}
            color="#e74c3c"
          />
          <ActionButton
            icon={FiUser}
            title="Missing Person"
            description="Report missing person"
            onClick={() => {
              setReportType('missing-person');
              setActiveTab('submit');
            }}
            color="#f39c12"
          />
          <ActionButton
            icon={FiPackage}
            title="Missing Property"
            description="Report lost property"
            onClick={() => {
              setReportType('missing-property');
              setActiveTab('submit');
            }}
            color="#3498db"
          />
          <ActionButton
            icon={FiFileText}
            title="General Report"
            description="Submit general report"
            onClick={() => {
              setReportType('general');
              setActiveTab('submit');
            }}
            color="#9b59b6"
          />
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '15px', color: '#1a1a2e' }}>Recent Notifications</h3>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: notif.read ? '#f0f0f0' : '#3498db20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FiAlertTriangle color={notif.read ? '#999' : '#3498db'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{notif.title}</div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSubmitForm = () => (
    <div style={{ padding: '30px' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Submit Report</h2>

      {/* Report Type Selector */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
          Select Report Type
        </label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { value: 'crime', label: 'Crime Report', icon: FiAlertTriangle },
            { value: 'missing-person', label: 'Missing Person', icon: FiUser },
            { value: 'missing-property', label: 'Missing Property', icon: FiPackage },
            { value: 'general', label: 'General Report', icon: FiFileText },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value)}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: reportType === type.value ? '2px solid #3498db' : '2px solid #ddd',
                background: reportType === type.value ? '#3498db10' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: reportType === type.value ? '600' : '400',
                color: reportType === type.value ? '#3498db' : '#666',
              }}
            >
              <type.icon />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crime Report Form */}
      {reportType === 'crime' && (
        <form onSubmit={handleCrimeSubmit} style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Crime Report Details</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Crime Type *
            </label>
            <input
              type="text"
              required
              value={crimeForm.type}
              onChange={(e) => setCrimeForm({ ...crimeForm, type: e.target.value })}
              placeholder="e.g., Theft, Assault, Vandalism"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Category *
            </label>
            <select
              required
              value={crimeForm.category}
              onChange={(e) => setCrimeForm({ ...crimeForm, category: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Location *
            </label>
            <input
              type="text"
              required
              value={crimeForm.location}
              onChange={(e) => setCrimeForm({ ...crimeForm, location: e.target.value })}
              placeholder="Enter location"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Date of Incident *
            </label>
            <input
              type="date"
              required
              value={crimeForm.date}
              onChange={(e) => setCrimeForm({ ...crimeForm, date: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Description *
            </label>
            <textarea
              required
              value={crimeForm.description}
              onChange={(e) => setCrimeForm({ ...crimeForm, description: e.target.value })}
              placeholder="Provide detailed description of the incident"
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Evidence (Photo/Video)
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setCrimeForm({ ...crimeForm, file: e.target.files[0] })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              background: submitting ? '#95a5a6' : '#3498db',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Crime Report'}
          </button>
        </form>
      )}

      {/* Missing Person Form */}
      {reportType === 'missing-person' && (
        <form onSubmit={handleMissingPersonSubmit} style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Missing Person Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={missingPersonForm.name}
                onChange={(e) => setMissingPersonForm({ ...missingPersonForm, name: e.target.value })}
                placeholder="Enter full name"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '15px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Age *
              </label>
              <input
                type="number"
                required
                value={missingPersonForm.age}
                onChange={(e) => setMissingPersonForm({ ...missingPersonForm, age: e.target.value })}
                placeholder="Age"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '15px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Gender *
              </label>
              <select
                required
                value={missingPersonForm.gender}
                onChange={(e) => setMissingPersonForm({ ...missingPersonForm, gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '15px',
                }}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Height
              </label>
              <input
                type="text"
                value={missingPersonForm.height}
                onChange={(e) => setMissingPersonForm({ ...missingPersonForm, height: e.target.value })}
                placeholder="e.g., 5'8\""
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '15px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Weight
              </label>
              <input
                type="text"
                value={missingPersonForm.weight}
                onChange={(e) => setMissingPersonForm({ ...missingPersonForm, weight: e.target.value })}
                placeholder="e.g., 150 lbs"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '15px',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Last Seen Location *
            </label>
            <input
              type="text"
              required
              value={missingPersonForm.lastSeenLocation}
              onChange={(e) => setMissingPersonForm({ ...missingPersonForm, lastSeenLocation: e.target.value })}
              placeholder="Enter last known location"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Last Seen Date *
            </label>
            <input
              type="date"
              required
              value={missingPersonForm.lastSeenDate}
              onChange={(e) => setMissingPersonForm({ ...missingPersonForm, lastSeenDate: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Description *
            </label>
            <textarea
              required
              value={missingPersonForm.description}
              onChange={(e) => setMissingPersonForm({ ...missingPersonForm, description: e.target.value })}
              placeholder="Physical description, clothing, distinguishing features"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Contact Information *
            </label>
            <input
              type="text"
              required
              value={missingPersonForm.contactInfo}
              onChange={(e) => setMissingPersonForm({ ...missingPersonForm, contactInfo: e.target.value })}
              placeholder="Phone number or email for updates"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMissingPersonForm({ ...missingPersonForm, photo: e.target.files[0] })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              background: submitting ? '#95a5a6' : '#f39c12',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Missing Person Report'}
          </button>
        </form>
      )}

      {/* Missing Property Form */}
      {reportType === 'missing-property' && (
        <form onSubmit={handleMissingPropertySubmit} style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Missing Property Details</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Item Name *
            </label>
            <input
              type="text"
              required
              value={missingPropertyForm.itemName}
              onChange={(e) => setMissingPropertyForm({ ...missingPropertyForm, itemName: e.target.value })}
              placeholder="e.g., iPhone 13, Wallet, Laptop"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Category *
            </label>
            <select
              required
              value={missingPropertyForm.category}
              onChange={(e) => setMissingPropertyForm({ ...missingPropertyForm, category: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            >
              <option value="electronics">Electronics</option>
              <option value="jewelry">Jewelry</option>
              <option value="documents">Documents</option>
              <option value="vehicle">Vehicle</option>
              <option value="clothing">Clothing</option>
              <option value="bag">Bag/Luggage</option>
              <option value="wallet">Wallet/Purse</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Last Seen Location *
            </label>
            <input
              type="text"
              required
              value={missingPropertyForm.lastSeenLocation}
              onChange={(e) => setMissingPropertyForm({ ...missingPropertyForm, lastSeenLocation: e.target.value })}
              placeholder="Where was it last seen?"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Date Lost *
            </label>
            <input
              type="date"
              required
              value={missingPropertyForm.dateLost}
              onChange={(e) => setMissingPropertyForm({ ...missingPropertyForm, dateLost: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Serial Number
              </label>
              <input
                type="text"
                value={missingPropertyForm.serialNumber}
                onChange={(e) => setMissingPropertyForm({ ...missingPropertyForm, serialNumber: e.target.value })}
                placeholder="If available"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '15px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Estimated Value
              </label>
              <input
                type="number"
                value={missingPropertyForm.estimatedValue}
                onChange={(e) => setMissingPropertyForm({ ...missingPropertyForm, estimatedValue: e.target.value })}
                placeholder="$"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '15px',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: '
