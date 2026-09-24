import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const TableGrid = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
    // Set up a real-time listener so tables update instantly when status changes
    const subscription = supabase
      .channel('table_status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'restaurant_tables' }, payload => {
        setTables(current => current.map(t => t.id === payload.new.id ? payload.new : t));
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  async function fetchTables() {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .order('table_number', { ascending: true });
    
    if (error) console.error('Error fetching tables:', error);
    else setTables(data);
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600';
      case 'occupied': return 'bg-red-500 hover:bg-red-600';
      case 'dirty': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Restaurant Layout...</div>;

  // Separate the tables into your two rows
  const lowerRow = tables.filter(t => t.table_number >= 1 && t.table_number <= 4);
  const upperRow = tables.filter(t => t.table_number >= 5 && t.table_number <= 9);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8">Grilled Fish POS - Table Map</h1>
      
      <div className="flex flex-col gap-12">
        {/* Upper Row (5-9) */}
        <div className="flex justify-center gap-4">
          {upperRow.map(table => (
            <button 
              key={table.id} 
              className={`${getStatusColor(table.status)} w-20 h-20 rounded-lg text-white font-bold text-xl shadow-md transition-all`}
              onClick={() => alert(`Opening Order for Table ${table.table_number}`)}
            >
              T{table.table_number}
            </button>
          ))}
        </div>

        {/* Lower Row (1-4) */}
        <div className="flex justify-center gap-4">
          {lowerRow.map(table => (
            <button 
              key={table.id} 
              className={`${getStatusColor(table.status)} w-20 h-20 rounded-lg text-white font-bold text-xl shadow-md transition-all`}
              onClick={() => alert(`Opening Order for Table ${table.table_number}`)}
            >
              T{table.table_number}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div> Available</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded"></div> Occupied</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded"></div> Dirty</div>
      </div>
    </div>
  );
};

export default TableGrid;