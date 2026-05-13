import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState({
    overview: null,
    districts: null,
    kpis: null,
    finance: null,
    loading: true,
    error: null
  });

  const fetchData = async () => {
    try {
      const [overviewRes, districtsRes, kpisRes, financeRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/overview'),
        fetch('http://localhost:5000/api/districts'),
        fetch('http://localhost:5000/api/kpis'),
        fetch('http://localhost:5000/api/finance')
      ]);

      const overview = await overviewRes.json();
      const districts = await districtsRes.json();
      const kpis = await kpisRes.json();
      const finance = await financeRes.json();

      setData({
        overview: overview.data,
        districts: districts.data,
        kpis: kpis.data,
        finance: finance.data,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching data from master excel:', err);
      setData(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
