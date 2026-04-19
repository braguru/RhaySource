import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#013597', '#FEBB00', '#99B5EE', '#D4A000'];

export const InventoryBarChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300, marginTop: '1.5rem', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #eee',
              borderRadius: '8px',
              color: '#000',
              boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
            }}
          />
          <Bar dataKey="value" fill="#013597" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300, marginTop: '1.5rem', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #eee',
              borderRadius: '8px',
              color: '#000',
              boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ActivityAreaChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 200, marginTop: '1rem', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#013597" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#013597" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #eee',
              borderRadius: '8px',
              color: '#000',
              boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#013597" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
