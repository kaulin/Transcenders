import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } from 'recharts'
  
  const GoalCharts = () => {
    const goalData = [
      { match: 'Match 1', goalsScored: 11, goalsConceded: 2 },
      { match: 'Match 2', goalsScored: 7, goalsConceded: 11 },
      { match: 'Match 3', goalsScored: 11, goalsConceded: 6 },
      { match: 'Match 4', goalsScored: 5, goalsConceded: 11 },
      { match: 'Match 5', goalsScored: 11, goalsConceded: 9 },
    ]
  
    return (
      <div className="flex w-full justify-center h-64">
        <ResponsiveContainer width="90%" height="100%">
          <AreaChart data={goalData}>
            <defs>
              <linearGradient id="scored" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#def569" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#9fb52f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="conceded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e8d4c1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#919191" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
            <XAxis dataKey="match" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend 
              formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="goalsConceded"
              stroke="#b3a394"
              fillOpacity={1}
              fill="url(#conceded)"
              name="Goals Conceded"
            />
            <Area
              type="monotone"
              dataKey="goalsScored"
              stroke="#effcae"
              fillOpacity={1}
              fill="url(#scored)"
              name="Goals Scored"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
  
  export default GoalCharts
  