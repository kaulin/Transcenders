import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const GoalCharts = () => {
  const goalData = [
    { match: '', scored: 11, conceded: 2 },
    { match: '', scored: 7, conceded: 11 },
    { match: '', scored: 11, conceded: 6 },
    { match: '', scored: 5, conceded: 11 },
    { match: '', scored: 11, conceded: 9 },
  ];

  return (
    <div className="flex w-full justify-center items-center h-40 pr-10">
      <ResponsiveContainer width="80%" height="80%">
        <AreaChart data={goalData}>
          <defs>
            <linearGradient id="scored" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a7d4373c" stopOpacity={1} />
              <stop offset="95%" stopColor="#fffb82" stopOpacity={0.2} />
              {/* <stop offset="5%" stopColor="#ff8ba860" stopOpacity={1} />
                <stop offset="95%" stopColor="#ff8bcb82" stopOpacity={0.2} /> */}
            </linearGradient>
            <linearGradient id="conceded" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5d6b2f52" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#5d6b2f52" stopOpacity={0} />
              {/* <stop offset="5%" stopColor="#741c4d" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#741c4d" stopOpacity={0} /> */}
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
          <XAxis stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Area
            type="monotone"
            dataKey="conceded"
            stroke="#fff"
            fillOpacity={1}
            fill="url(#conceded)"
            name="Opponent"
          />
          <Area
            type="monotone"
            dataKey="scored"
            stroke="#fff"
            fillOpacity={1}
            fill="url(#scored)"
            name="You"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GoalCharts;
