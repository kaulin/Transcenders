const PlayerLoginForm = ({ playerNumber }: { playerNumber: number }) => (
	<div className="mb-6">
	  <h2 className="profile-label">Player {playerNumber}</h2>
	  <input
		type="text"
		placeholder="username"
		className="profile-input-field"
	  />
	  <input
		type="password"
		placeholder="password"
		className="profile-input-field"
	  />
	  <button className="ml-auto mt-2 p-2">
		  ➜
	  </button>
	</div>
  );
  
  export default PlayerLoginForm