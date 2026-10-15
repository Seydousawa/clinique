import React, { useState, useEffect } from 'react';
import { Users, Calendar, Heart, Clock, TrendingUp, Activity, Pill, Home } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useHeader } from '../components/HeaderContext';

export default function ClinicDashboard() {
  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader('Dashboard', Home);
  }, [setHeader]);
  const [stats, setStats] = useState([
    { icon: Users, label: 'Patients', value: 0, color: '#10b981', bg: '#d1fae5' },
    { icon: Calendar, label: 'Rendez-vous', value: 0, color: '#3b82f6', bg: '#dbeafe' },
    { icon: Heart, label: 'Médecins', value: 0, color: '#f59e0b', bg: '#fef3c7' },
    { icon: Activity, label: 'Hospitalisations', value: 0, color: '#ef4444', bg: '#fee2e2' }
  ]);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Données pour les graphes
  const [appointmentsByDay, setAppointmentsByDay] = useState([]);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState([]);
  const [patientTrend, setPatientTrend] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoints = [
        'http://127.0.0.1:8000/api/patients/',
        'http://127.0.0.1:8000/api/rendezvous/',
        'http://127.0.0.1:8000/api/medecins/',
        'http://127.0.0.1:8000/api/hospitalisations/'
      ];

      const responses = await Promise.allSettled(
        endpoints.map(url =>
          fetch(url)
            .then(response => {
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              return response.json();
            })
            .catch(err => {
              console.error(`Erreur avec ${url}:`, err);
              return null;
            })
        )
      );

      const [patientsData, appointmentsData, medicinesData, hospitalizationsData] = responses.map(
        (result) => {
          if (result.status === 'fulfilled' && result.value) {
            if (Array.isArray(result.value)) return result.value;
            if (result.value.data && Array.isArray(result.value.data)) return result.value.data;
            if (result.value.results && Array.isArray(result.value.results)) return result.value.results;
            return [];
          }
          return [];
        }
      );

      // Mise à jour des statistiques
      setStats(prev => [
        { ...prev[0], value: patientsData?.length || 0 },
        { ...prev[1], value: appointmentsData?.length || 0 },
        { ...prev[2], value: medicinesData?.length || 0 },
        { ...prev[3], value: hospitalizationsData?.length || 0 }
      ]);

      // Debug: afficher la structure des données
      console.log('Données rendez-vous reçues:', appointmentsData);
      
      // Traitement des rendez-vous
      const recentAppointments = (appointmentsData || [])
        .slice(0, 5)
        .map(apt => {
          console.log('Rendez-vous individual:', apt);
          
          // Récupérer la date et extraire l'heure
          const dateRdv = apt.date_rdv || apt.date_rendez_vous || apt.date || '';
          let heure = 'N/A';
          
          if (dateRdv) {
            try {
              const dateObj = new Date(dateRdv);
              heure = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
              console.error('Erreur conversion heure:', e);
              heure = '';
            }
          }
          
          return {
            id: apt.id || Math.random(),
            patient_nom: (apt.patient?.prenom || '') + ' ' + (apt.patient_nom || apt.patient?.nom || ''),
            date_rendez_vous: dateRdv,
            heure: heure,
            medecin_nom: apt.medecin_nom || apt.medecin?.nom || 'N/A',
            statut: apt.statut || apt.status || 'N/A'
          };
        });

      setAppointments(recentAppointments);

      // Données pour graphes
      generateChartData(appointmentsData || [], patientsData || []);

    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (appointments, patients) => {
    // Graphe des rendez-vous par jour de la semaine
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const appointmentCounts = new Array(7).fill(0);

    appointments.forEach(apt => {
      const date = new Date(apt.date_rendez_vous || apt.date);
      if (!isNaN(date)) {
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
        appointmentCounts[dayIndex]++;
      }
    });

    setAppointmentsByDay(days.map((day, idx) => ({
      name: day,
      rendez_vous: appointmentCounts[idx]
    })));

    // Graphe du statut des rendez-vous
    const statusCount = { confirmé: 0, 'en attente': 0, annulé: 0, complété: 0 };
    appointments.forEach(apt => {
      const status = (apt.statut || apt.status || 'en attente').toLowerCase();
      if (statusCount[status] !== undefined) statusCount[status]++;
      else statusCount['en attente']++;
    });

    setAppointmentsByStatus([
      { name: 'Confirmé', value: statusCount.confirmé, fill: '#10b981' },
      { name: 'En attente', value: statusCount['en attente'], fill: '#f59e0b' },
      { name: 'Annulé', value: statusCount.annulé, fill: '#ef4444' },
      { name: 'Complété', value: statusCount.complété, fill: '#3b82f6' }
    ].filter(item => item.value > 0));

    // Tendance des patients (simulation)
    setPatientTrend([
      { mois: 'Jan', patients: Math.floor(patients.length * 0.6) },
      { mois: 'Fév', patients: Math.floor(patients.length * 0.7) },
      { mois: 'Mar', patients: Math.floor(patients.length * 0.75) },
      { mois: 'Avr', patients: Math.floor(patients.length * 0.85) },
      { mois: 'Mai', patients: Math.floor(patients.length * 0.9) },
      { mois: 'Jun', patients: patients.length }
    ]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '30px 20px' }}>
      {/* Header */}
      

      {/* Message d'erreur */}
      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '2px solid #ef4444',
          color: '#dc2626',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>⏳ Chargement des données...</div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>Veuillez patienter quelques instants</div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: `3px solid ${stat.color}`,
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                  transform: 'scale(1)',
                  ':hover': { transform: 'scale(1.05)' }
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {stat.label}
                      </p>
                      <h3 style={{ margin: '10px 0 0 0', fontSize: '36px', fontWeight: 'bold', color: stat.color }}>
                        {stat.value}
                      </h3>
                    </div>
                    <div style={{ background: stat.bg, padding: '14px', borderRadius: '12px' }}>
                      <Icon size={28} color={stat.color} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {/* Graphe Ligne - Tendance Patients */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} color='#0369a1' />
                Tendance des Patients
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={patientTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mois" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ background: '#fff', border: '2px solid #0369a1', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="patients" stroke="#0369a1" strokeWidth={3} dot={{ fill: '#0369a1', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Graphe Camembert - Statut Rendez-vous */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color='#0369a1' />
                Statut des Rendez-vous
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} rendez-vous`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Graphe Barres - Rendez-vous par Jour */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              gridColumn: 'span 2'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color='#0369a1' />
                Rendez-vous par Jour de la Semaine
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ background: '#fff', border: '2px solid #0369a1', borderRadius: '8px' }} />
                  <Bar dataKey="rendez_vous" fill="#0369a1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tableau des Rendez-vous */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={24} color='#0369a1' />
              Rendez-vous Récents
            </h2>

            {appointments.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderBottom: '2px solid #0369a1' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#0c4a6e' }}>Patient</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#0c4a6e' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#0c4a6e' }}>Heure</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#0c4a6e' }}>Médecin</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#0c4a6e' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt, idx) => (
                      <tr key={apt.id || idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '12px', color: '#1e293b', fontWeight: '600' }}>
                          {apt.patient_nom}
                        </td>
                        <td style={{ padding: '12px', color: '#64748b' }}>
                          {apt.date_rendez_vous ? new Date(apt.date_rendez_vous).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td style={{ padding: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={14} color='#0369a1' />
                          {apt.heure}
                        </td>
                        <td style={{ padding: '12px', color: '#64748b' }}>
                          Dr. {apt.medecin_nom}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: apt.statut?.toLowerCase() === 'confirmé' ? '#d1fae5' : apt.statut?.toLowerCase() === 'en attente' ? '#fef3c7' : '#fee2e2',
                            color: apt.statut?.toLowerCase() === 'confirmé' ? '#065f46' : apt.statut?.toLowerCase() === 'en attente' ? '#92400e' : '#7f1d1d',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'capitalize'
                          }}>
                            {apt.statut || 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ fontSize: '16px', marginBottom: '10px' }}>📝 Aucun rendez-vous trouvé</div>
                <div style={{ fontSize: '14px' }}>Les données peuvent être vides ou l'API ne répond pas</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}