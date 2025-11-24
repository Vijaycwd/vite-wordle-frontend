import { createContext, useContext, useState } from "react";

const LeaderboardContext = createContext();

export const LeaderboardProvider = ({ children }) => {
  const [todayLeaderboard, setTodayLeaderboard] = useState([]);
  const [missedUsers, setMissedUsers] = useState([]);

  return (
    <LeaderboardContext.Provider 
      value={{ todayLeaderboard, setTodayLeaderboard, missedUsers, setMissedUsers }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => useContext(LeaderboardContext);
