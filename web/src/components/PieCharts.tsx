import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTranslation } from "react-i18next"

// const COLORS = ['#ffdcc4c3', '#6e5d414e']
// const COLORS = ['#d6fb819a', '#6e5d414e']
const COLORS = ['#a7d4373c', '#5d6b2f52']
// const COLORS = ['#ff8ba860', '#741c4c82']

const PieCharts = () => {
  const { t } = useTranslation()

  const singleMatchData = [
    { name: t('wins'), value: 30 },
    { name: t('losses'), value: 5 },
  ];

  const tournamentData = [
    { name: t('wins'), value: 12 },
    { name: t('losses'), value: 8 },
  ];

  const matchTypeData = [
    { name: t('tournament'), value: 20 },
    { name: t('one_v_one'), value: 35 },
  ]; 

  return (
    <div className="flex flex-col w-full">
      {[
        { title: t('mode'), data: matchTypeData },
        { title: t('one_v_one'), data: singleMatchData },
        { title: t('tournament'), data: tournamentData },
      ].map(({ title, data }, i) => (
        <div key={i} className="flex flex-col sm:flex-row w-full items-center justify-between">
          <div className="flex flex-col items-center sm:items-start">
            <div className="text-white text-center sm:text-xl font-fascinate uppercase">{title}</div>
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 mb-1 text-md">
              <span
                className="inline-block w-4 h-4 rounded-full border border-white"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span>{entry.name}</span>
            </div>
            ))}
          </div>

            <div className="w-40 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={45}
                  >
                    {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
              </ResponsiveContainer>
            </div>
        </div>
      ))}
    </div>
  )
}

export default PieCharts