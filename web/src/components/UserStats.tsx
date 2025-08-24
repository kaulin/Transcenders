// import { ApiClient } from "@transcenders/api-client";
// import { useEffect } from "react";
// import { useTranslation } from "react-i18next";

// type UserStatsProps = {
//   userId: number | undefined;
// };

// export default function UserStats({userId}: UserStatsProps) {
//   const { t } = useTranslation();
  
//   useEffect(() => {
//     async function fetchStats() {
//       if (!userId)
//         return;
      
//       try {
//         const stats = await ApiClient.score.getStatsForUser(userId);
//       } catch (err: any) {
        
//       }
//     }
//   })
  
//   return (
//     <div className="flex flex-col font-fascinate uppercase text-center">
//       <p className="text-2xl text-[#fff] mb-2">{t('games_played')}</p>
//       <div className="flex justify-between text-md">
//         <p>{t('total')}</p>
//         <p className="font-sans">{wins + losses}</p>
//       </div>
//       <div className="flex justify-between text-md">
//         <p>{t('wins')}</p>
//         <p className="font-sans">{wins}</p>
//       </div>
//       <div className="flex justify-between text-md">
//         <p>{t('losses')}</p>
//         <p className="font-sans">{losses}</p>
//       </div>
//     </div>
//   )
// };