import React from 'react';
import { LineChart, PieChart, BarChart } from '@shadcn/ui';

function App({ monthlyBookings, statusDistribution, dayOfWeekPopularity }) {
  return (
    <div>
      <h2>Monthly Bookings</h2>
      <LineChart
        data={monthlyBookings}
        xAxis={[{ dataKey: 'month' }]}
        yAxis={[{ dataKey: 'count' }]}
        series={[{ dataKey: 'count', label: 'Bookings' }]}
        width={600}
        height={300}
      />

      <h2>Status Distribution</h2>
      <PieChart
        data={statusDistribution}
        dataKey="count"
        nameKey="status"
        width={400}
        height={400}
      />

      <h2>Day of Week Popularity</h2>
      <BarChart
        data={dayOfWeekPopularity}
        xAxis={[{ dataKey: 'day' }]}
        yAxis={[{ dataKey: 'count' }]}
        series={[{ dataKey: 'count', label: 'Bookings' }]}
        width={600}
        height={300}
      />
    </div>
  );
}

export default App;