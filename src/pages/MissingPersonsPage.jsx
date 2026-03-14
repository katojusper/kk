import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { FaUserFriends, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaPhone } from 'react-icons/fa'

export function MissingPersonsPage() {
  const [persons, setPersons] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMissingPersons = async () => {
      try {
        const { data, error } = await supabase
          .from('missing_persons')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          // Handle specific error cases
          if (error.code === 'PGRST116') {
            setError('Database table not found. Please create the missing_persons table in Supabase.')
          } else {
            setError(error.message || 'Failed to load missing persons')
          }
          setLoading(false)
          return
        }
        setPersons(data || [])
        setLoading(false)
      } catch (err) {
        setError(err?.message ?? 'Failed to load missing persons')
        setLoading(false)
      }
    }

    fetchMissingPersons()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return persons
    return persons.filter((p) => 
      (p.name ?? '').toLowerCase().includes(q) ||
      (p.last_seen_location ?? '').toLowerCase().includes(q)
    )
  }, [persons, search])

  return (
    <div className="rc-page-container">
      <h2 className="rc-page-title">
        <FaUserFriends style={{ marginRight: '0.5rem', display: 'inline' }} />
        Missing Persons
      </h2>
      <p className="rc-page-subtitle">
        View all reported missing persons. Search by name or location.
      </p>

      <div style={{ maxWidth: 360, marginBottom: 10, position: 'relative' }}>
        <FaSearch style={{ 
          position: 'absolute', 
          left: '0.75rem', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: '#9ca3af'
        }} />
        <input
          className="rc-input"
          placeholder="Search by name or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {loading && <p className="rc-hint">Loading missing persons…</p>}
      {error && (
        <p className="rc-hint" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
          marginTop: 12,
        }}
      >
        {filtered.map((p, idx) => (
          <article
            key={p.id ?? idx}
            className="rc-card"
            style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div className="rc-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaUserFriends style={{ color: '#dc2626' }} />
              {p.name ?? 'Unknown'}
            </div>
            <p className="rc-card-description" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaMapMarkerAlt style={{ fontSize: '0.875rem' }} />
              Last seen: {p.last_seen_location ?? 'N/A'}
            </p>
            <p className="rc-card-description" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 12 }}>
              <FaCalendarAlt style={{ fontSize: '0.75rem' }} />
              Missing since: {p.date_missing ?? 'N/A'}
            </p>
            <p className="rc-card-description" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 12 }}>
              <FaPhone style={{ fontSize: '0.75rem' }} />
              Contact: {p.contact_info ?? 'N/A'}
            </p>
            {p.notes && (
              <p className="rc-card-description" style={{ fontSize: 12, marginTop: '0.25rem' }}>
                Notes: {p.notes}
            </p>
            )}
          </article>
        ))}

        {!loading && !error && filtered.length === 0 && (
          <p className="rc-hint">No matching records.</p>
        )}
      </div>
    </div>
  )
}

