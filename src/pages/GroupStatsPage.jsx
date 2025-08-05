import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import GroupLeaderboardScores from './GroupLeaderboard/GroupLeaderboardScores';
import GroupScoreByDate from './GroupLeaderboard/GroupScoreByDate';
import MemberProfile from '../constant/Models/MemberProfile';
// import GroupGameChat from './GroupLeaderboard/GroupGameChat';
// import dayjs from "dayjs";

function GroupStatsPage() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const { id, groupName, game } = useParams(); // Extract groupName and game from URL
  const [group, setGroup] = useState(null);
  const [latestJoinDate, setLatestJoinDate] = useState(null);
  // Get user ID from localStorage
  const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
  const userId = userAuthData.id;
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
        try {
            const res = await axios.get(`${baseURL}/groups/get-groups.php?id=${id}`);
            if (res.data.status === "success" && res.data.groups.length > 0) {
                const fetchedGroup = res.data.groups[0];
                setGroup(fetchedGroup);
            } else {
                setGroup(null);
                toast.error("Group not found.");
            }
        } catch (err) {
            setGroup(null);
            toast.error("Failed to load group details.");
        }
    };

    fetchGroupDetails();
  }, [id, userId]);

  // const getAMPMPeriod = () => {
  //   const hour = new Date().getHours();
  //   return hour < 12 ? 'AM' : 'PM';
  // };

  return (
    <>
    <Container>
      <Row>
        <Col className="text-center mt-4">
          <h2 className='text-capitalize py-3'>{group?.name || ""} - {game}</h2>
          {/* <h3 className='text-capitalize py-3'>{game} Leaderboard</h3> */}
          {/* <h3 className='text-capitalize py-3'>{game.charAt(0).toUpperCase() + game.slice(1)} Stats</h3> */}
          <GroupLeaderboardScores setLatestJoinDate={setLatestJoinDate}  setSelectedMember={setSelectedMember} setShowProfile={setShowProfile}/>
        </Col>
      </Row>
      {/* <Row>
        <Col>
          <GroupGameChat
            groupId={id}
            gameName={game}
            createdAt={dayjs().format("YYYY-MM-DD HH:mm:ss")}
            userId={userId}
          />
        </Col>
      </Row> */}
      <Row>
        <Col>
          <GroupScoreByDate
            latestJoinDate={latestJoinDate}
            setSelectedMember={setSelectedMember}
            setShowProfile={setShowProfile}
          />

        </Col>
      </Row>
    </Container>
    <MemberProfile
      show={showProfile}
      onHide={() => setShowProfile(false)}
      selectedMember={selectedMember}
      baseURL={baseURL}
    />

    </>
  );
}

export default GroupStatsPage;
