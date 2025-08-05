const MatchHistory = () => {
  return (
    <div className="relative h-full w-full px-2 overflow-y-auto custom-scrollbar flex flex-col gap-12">
      {[
        { outcome: 'win', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'loss', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'win', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'loss', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'win', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'win', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'loss', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'win', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'loss', p1: 'Player1', p2: 'Player2', date: '24/05' },
        { outcome: 'win', p1: 'Player1', p2: 'Player2', date: '24/05' },
      ].map(({ outcome, p1, p2, date }) => (
        <div className="flex flex-col justify-center items-center">
          <div className="flex justify-center items-center gap-6">
            <div className="text-[#fff] font-fascinate uppercase text-xl">{outcome}</div>
            <div className="text-[#fff]">{date}</div>
          </div>
          <div className="text-[#fff]">{p1}</div>
          <div className="text-[#fff]">{p2}</div>
        </div>
      ))}
    </div>
  );
};

export default MatchHistory;
