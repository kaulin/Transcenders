const MatchHistory = () => {

  return (
	<div className="flex flex-col w-full h-full justify-between">
	  {[
		{ outcome: "win", p1: "Player1", p2: "Player2", date: "24/05" },
		{ outcome: "loss", p1: "Player1", p2: "Player2", date: "24/05" },
		{ outcome: "win", p1: "Player1", p2: "Player2", date: "24/05" },
		{ outcome: "loss", p1: "Player1", p2: "Player2", date: "24/05" },
		{ outcome: "win", p1: "Player1", p2: "Player2", date: "24/05" },
		{ outcome: "-", p1: "-", p2: "-", date: "-" },
		{ outcome: "-", p1: "-", p2: "-", date: "-" },
		{ outcome: "-", p1: "-", p2: "-", date: "-" },
		{ outcome: "-", p1: "-", p2: "-", date: "-" },
		{ outcome: "-", p1: "-", p2: "-", date: "-" },
	  ].map(({ outcome, p1, p2, date }) => (
		<div className="flex bg-[#f6dfd148] rounded-full p-4 justify-around items-center">
			<div>{outcome}</div>
			<div>{p1} - {p2}</div>
			<div>{date}</div>
		</div>
	  ))}
	</div>
  );
};

export default MatchHistory