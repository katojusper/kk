import { useState, useEffect } from "react";
import {
  isSupabaseReachable,
  isSupabaseConfigured,
  getConnectionMessage,
  supabase,
} from "../lib/supabaseClient.js";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSpinner,
  FaServer,
  FaKey,
  FaDatabase,
  FaFolder,
  FaInfoCircle,
} from "react-icons/fa";

export function ConnectionDiagnostic({ onClose }) {
  const [checking, setChecking] = useState(true);
  const [results, setResults] = useState({
    configured: false,
    reachable: false,
    database: false,
    storage: false,
    auth: false,
  });
  const [details, setDetails] = useState({});

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    setChecking(true);
    const testResults = {};

    // Test 1: Configuration
    testResults.configured = isSupabaseConfigured;
    testResults.configuredMsg = isSupabaseConfigured
      ? "Supabase is properly configured"
      : "VITE_SUPABASE_ANON_KEY is missing or invalid";

    // Test 2: Connection
    const reachable = await isSupabaseReachable();
    testResults.reachable = reachable;
    testResults.reachableMsg = reachable
      ? "Successfully connected to Supabase"
      : getConnectionMessage();

    // Test 3: Database
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id")
        .limit(1);
      testResults.database = !error;
      testResults.databaseMsg = error
        ? `Database error: ${error.message}`
        : "Database tables accessible";
    } catch (err) {
      testResults.database = false;
      testResults.databaseMsg = `Database error: ${err.message}`;
    }

    // Test 4: Storage
    try {
      const { data, error } = await supabase.storage.listBuckets();
      const hasEvidence = data?.some((b) => b.name === "evidence");
      testResults.storage = !error && hasEvidence;
      testResults.storageMsg = error
        ? `Storage error: ${error.message}`
        : hasEvidence
          ? "Evidence bucket found"
          : "Evidence bucket not found";
    } catch (err) {
      testResults.storage = false;
      testResults.storageMsg = `Storage error: ${err.message}`;
    }

    // Test 5: Auth
    try {
      const { data, error } = await supabase.auth.getSession();
      testResults.auth = !error;
      testResults.authMsg = error
        ? `Auth error: ${error.message}`
        : "Authentication system working";
    } catch (err) {
      testResults.auth = false;
      testResults.authMsg = `Auth error: ${err.message}`;
    }

    setResults(testResults);
    setChecking(false);
  }

  const getIcon = (status) => {
    if (checking) return <FaSpinner className="spin" />;
    if (status) return <FaCheckCircle color="#10b981" />;
    return <FaTimesCircle color="#ef4444" />;
  };

  const allGood =
    results.configured &&
    results.reachable &&
    results.database &&
    results.storage &&
    results.auth;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              margin: "0 0 8px 0",
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a1a2e",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaServer /> Connection Diagnostic
          </h2>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Checking your Supabase connection and configuration
          </p>
        </div>

        {/* Overall Status */}
        {!checking && (
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: allGood ? "#d1fae5" : "#fee2e2",
              border: `2px solid ${allGood ? "#10b981" : "#ef4444"}`,
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {allGood ? (
              <FaCheckCircle size={32} color="#10b981" />
            ) : (
              <FaExclamationTriangle size={32} color="#ef4444" />
            )}
            <div>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "16px",
                  color: allGood ? "#065f46" : "#991b1b",
                }}
              >
                {allGood
                  ? "✅ All Systems Operational"
                  : "⚠️ Issues Detected"}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: allGood ? "#065f46" : "#991b1b",
                  marginTop: "4px",
                }}
              >
                {allGood
                  ? "Your Supabase connection is working perfectly!"
                  : "Please review the issues below and follow the suggested fixes."}
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Configuration Test */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              {getIcon(results.configured)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", color: "#1a1a2e" }}>
                  <FaKey
                    style={{ marginRight: "8px", display: "inline" }}
                    size={14}
                  />
                  Configuration
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  {results.configuredMsg || "Checking..."}
                </div>
              </div>
            </div>
            {!results.configured && !checking && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#92400e",
                }}
              >
                <strong>Fix:</strong>
                <br />
                1. Create a <code>.env</code> file in project root
                <br />
                2. Add: <code>VITE_SUPABASE_ANON_KEY=your-key-here</code>
                <br />
                3. Get key from Supabase Dashboard → Settings → API
                <br />
                4. Restart dev server: <code>npm run dev</code>
              </div>
            )}
          </div>

          {/* Connection Test */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              {getIcon(results.reachable)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", color: "#1a1a2e" }}>
                  <FaServer
                    style={{ marginRight: "8px", display: "inline" }}
                    size={14}
                  />
                  Server Connection
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  {results.reachableMsg || "Checking..."}
                </div>
              </div>
            </div>
            {!results.reachable && !checking && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#92400e",
                }}
              >
                <strong>Fix:</strong>
                <br />
                1. Check your internet connection
                <br />
                2. Verify Supabase project is active
                <br />
                3. Check{" "}
                <a
                  href="https://status.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  status.supabase.com
                </a>
                <br />
                4. Use demo mode for offline testing
              </div>
            )}
          </div>

          {/* Database Test */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              {getIcon(results.database)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", color: "#1a1a2e" }}>
                  <FaDatabase
                    style={{ marginRight: "8px", display: "inline" }}
                    size={14}
                  />
                  Database Tables
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  {results.databaseMsg || "Checking..."}
                </div>
              </div>
            </div>
            {!results.database && !checking && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#92400e",
                }}
              >
                <strong>Fix:</strong>
                <br />
                Run migrations: <code>npm run db:push</code>
                <br />
                Or manually run SQL migrations in Supabase dashboard
              </div>
            )}
          </div>

          {/* Storage Test */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              {getIcon(results.storage)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", color: "#1a1a2e" }}>
                  <FaFolder
                    style={{ marginRight: "8px", display: "inline" }}
                    size={14}
                  />
                  Storage Bucket
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  {results.storageMsg || "Checking..."}
                </div>
              </div>
            </div>
            {!results.storage && !checking && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#92400e",
                }}
              >
                <strong>Fix:</strong>
                <br />
                1. Go to Supabase Dashboard → Storage
                <br />
                2. Create new bucket named <code>evidence</code>
                <br />
                3. Set to public or configure policies
              </div>
            )}
          </div>

          {/* Auth Test */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              {getIcon(results.auth)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", color: "#1a1a2e" }}>
                  <FaInfoCircle
                    style={{ marginRight: "8px", display: "inline" }}
                    size={14}
                  />
                  Authentication
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  {results.authMsg || "Checking..."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Mode Info */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "12px",
            background: "#e0e7ff",
            border: "1px solid #818cf8",
          }}
        >
          <div
            style={{
              fontWeight: "600",
              color: "#3730a3",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            💡 Demo Mode Available
          </div>
          <div style={{ fontSize: "13px", color: "#3730a3", lineHeight: 1.5 }}>
            You can test the app offline using demo credentials:
            <br />
            <strong>Email:</strong> jusperkato@gmail.com
            <br />
            <strong>Password:</strong> admon@123
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={runDiagnostics}
            disabled={checking}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "white",
              color: "#374151",
              fontSize: "15px",
              fontWeight: "600",
              cursor: checking ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {checking ? (
              <>
                <FaSpinner className="spin" />
                Checking...
              </>
            ) : (
              <>
                <FaSpinner />
                Re-check
              </>
            )}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#3b82f6",
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        code {
          background: rgba(0,0,0,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
