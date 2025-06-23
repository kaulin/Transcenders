import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#a8d43752', '#5d6b2f52']

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
    { name: 'Match', value: 35 },
  ]; 

  return (
    <div className="flex flex-col gap-12 md:flex-row md:gap-0 w-full">
      {[
        { title: "Matches by Type", data: matchTypeData },
        { title: "Single Match", data: singleMatchData },
        { title: "Tournament", data: tournamentData },
      ].map(({ title, data }, i) => (
        <div key={i} className="flex flex-col flex-1 items-center justify-center min-w-[200px]">
          <div>
            <div className="text-white text-center">{title}</div>
            <div className="w-60 h-52">
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
        </div>
      ))}
    </div>
  )
}

export default PieCharts