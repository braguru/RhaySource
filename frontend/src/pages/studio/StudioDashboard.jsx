import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { FiTrendingUp, FiShoppingBag, FiLayers, FiActivity, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { InventoryBarChart, CategoryPieChart, ActivityAreaChart } from '../../components/features/studio/DashboardCharts';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <div className="stat-card" style={{ padding: '2rem', flex: 1, minWidth: '280px', position: 'relative', borderRadius: '8px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '8px', 
        background: '#fcfcfc', 
        border: '1px solid var(--studio-border)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: color || 'var(--studio-sidebar)'
      }}>
        <Icon size={20} />
      </div>
      {trendValue && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          fontSize: '0.75rem', 
          color: trend === 'up' ? 'var(--studio-success)' : 'var(--studio-error)',
          fontWeight: '600',
          padding: '4px 8px',
          background: trend === 'up' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          borderRadius: '4px'
        }}>
          {trend === 'up' ? '↑' : '↓'}
          {trendValue}
        </div>
      )}
    </div>
    <p style={{ fontSize: '0.75rem', color: 'var(--studio-text-muted)', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      {title}
    </p>
    <h3 style={{ fontSize: '2rem', color: 'var(--studio-text)', margin: 0, fontWeight: '700', letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>
      {value}
    </h3>
  </div>
);

export default function StudioDashboard() {
  const [data, setData] = useState({
    products: [],
    stores: [],
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      const [
        { data: products },
        { data: stores }
      ] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('stores').select('*')
      ]);

      setData({
        products: products || [],
        stores: stores || [],
        loading: false
      });
    }

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalProducts = data.products.length;
    const totalStores = data.stores.length;
    const featuredCount = data.products.filter(p => p.is_featured).length;
    const totalValue = data.products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    
    return [
      { id: 1, title: 'Total Inventory', value: totalProducts, icon: FiShoppingBag, trend: 'up', trendValue: '12%', color: 'var(--studio-sidebar-text)' },
      { id: 2, title: 'Active Stores', value: totalStores, icon: FiLayers, trend: 'up', trendValue: '5%', color: 'var(--studio-sidebar-text)' },
      { id: 3, title: 'Featured Pieces', value: featuredCount, icon: FiTrendingUp, trend: 'up', trendValue: '8%', color: 'var(--studio-sidebar-text)' },
      { id: 4, title: 'Catalog Valuation', value: `GH₵${totalValue.toLocaleString()}`, icon: FiActivity, trend: 'up', trendValue: '2.4%', color: 'var(--studio-accent)' },
    ];
  }, [data]);

  const chartData = useMemo(() => {
    const categories = {};
    data.products.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    const barData = Object.entries(categories).map(([name, value]) => ({ name, value })).slice(0, 5);
    const pieData = Object.entries(categories).map(([name, value]) => ({ name, value }));
    const activityData = [
      { name: 'Mon', value: 40 },
      { name: 'Tue', value: 30 },
      { name: 'Wed', value: 45 },
      { name: 'Thu', value: 60 },
      { name: 'Fri', value: 55 },
      { name: 'Sat', value: 70 },
      { name: 'Sun', value: 80 },
    ];

    return { barData, pieData, activityData };
  }, [data]);

  return (
    <AdminLayout title="Studio Overview">
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {stats.map(stat => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="studio-glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--studio-text)', marginBottom: '1.5rem', fontWeight: '600' }}>Inventory Valuation</h2>
          <InventoryBarChart data={chartData.barData} />
        </div>
        <div className="studio-glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--studio-text)', marginBottom: '1.5rem', fontWeight: '600' }}>Collection Mix</h2>
          <CategoryPieChart data={chartData.pieData} />
        </div>
      </div>

      <div className="studio-glass" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--studio-text)', marginBottom: '1.5rem', fontWeight: '600' }}>System Performance & Activity</h2>
        <ActivityAreaChart data={chartData.activityData} />
      </div>

      <div className="studio-glass" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--studio-text)', marginBottom: '1.5rem', fontWeight: '600' }}>Recent Activity</h2>
        <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--studio-border)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--studio-text-muted)', fontSize: '0.85rem' }}>
            The ledger is clear. All inventory systems are currently synchronized.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
