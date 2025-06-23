const MatchHistory = () => {

	return (
	  <div className="flex flex-col w-full h-full gap-8">
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
		  <div className="flex flex-col md:flex-row md:min-w-[400px] bg-[#605c4c13] border rounded-full p-4 justify-around items-center">
			  <div className="flex justify-center gap-6">
				  <div className="text-[#fff] font-fascinate uppercase">{outcome}</div>
				  <div className="text-[#fff]">{date}</div>
			  </div>
			  <div className="text-[#fff]">{p1} - {p2}</div>
		  </div>
		))}
	  </div>
	)
  }
  
  export default MatchHistory