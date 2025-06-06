import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#ffb6c19d', '#6e5c3f']

const PieCharts = () => {

  const singleMatchData = [
    { name: 'Wins', value: 30 },
    { name: 'Losses', value: 5 },
  ];

  const tournamentData = [
    { name: 'Wins', value: 12 },
    { name: 'Losses', value: 8 },
  ];

  const matchTypeData = [
    { name: 'Tournament', value: 20 },
    { name: 'Single Match', value: 35 },
  ]; 

  return (
    <div className="flex w-full">
      {[
        { title: "Matches by Type", data: matchTypeData },
        { title: "Single Match", data: singleMatchData },
        { title: "Tournament", data: tournamentData },
      ].map(({ title, data }, i) => (
        <div key={i} className="flex flex-col items-center min-w-[200px] flex-1">
          <div className="text-white mb-2">{title}</div>
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                >
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PieCharts
