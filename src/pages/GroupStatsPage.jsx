import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import GroupLeaderboardScores from './GroupLeaderboard/GroupLeaderboardScores';
import GroupScoreByDate from './GroupLeaderboard/GroupScoreByDate';
import MemberProfile from '../constant/Models/MemberProfile';
import GroupGameChat  from '../pages/GroupLeaderboard/GroupGameChat';
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import MessageLeaderboard from './GroupLeaderboard/MessageLeaderboard';

function GroupStatsPage() {

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const msgId = params.get("msg_id");

  const baseURL = import.meta.env.VITE_BASE_URL;
  const { id, groupName, game } = useParams(); // Extract groupName and game from URL
  const [group, setGroup] = useState(null);
  const [latestJoinDate, setLatestJoinDate] = useState(null);
  // Get user ID from localStorage
  const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};
  const userId = userAuthData.id;
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const now = new Date();
  const period = now.getHours() < 12 ? "AM" : "PM";
  const [searchParams, setSearchParams] = useSearchParams();
  const msgFrom = searchParams.get("msg_from");
  const msgReportDate = searchParams.get("msgReportDate");
  const msgPeriod = searchParams.get("msgPeriod");

  const [reportDate, setReportDate] = useState(null);
  useEffect(() => {
    setReportDate(msgReportDate);
  }, []);
  
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
        <Col className="text-center my-4">
          <h2 className='text-capitalize py-3'>
            {group?.name || ""} - {game}
          </h2>

          {reportDate ? (
            <>
            <MessageLeaderboard
              latestJoinDate={latestJoinDate}
              setSelectedMember={setSelectedMember}
              setShowProfile={setShowProfile}
              msgReportDate={msgReportDate}
              msgPeriod={msgPeriod}
              groupId={id}
              groupName={group?.name}
              gameName={game}
            />
            </>
          ) : (
            <GroupLeaderboardScores
              setLatestJoinDate={setLatestJoinDate}
              setSelectedMember={setSelectedMember}
              setShowProfile={setShowProfile}
            />
          )}
        </Col>

      </Row>
      <Row className="justify-content-center"> 
        <Col md={6}>
          <GroupGameChat
            groupId={id}
            gameName={game}
            createdAt={dayjs().format("YYYY-MM-DD HH:mm:ss")}
            periodType={game === "phrazle" ? period : ""}
            userId={userId}
            highlightMsgId={msgId}
            
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <GroupScoreByDate
            latestJoinDate={latestJoinDate}
            setSelectedMember={setSelectedMember}
            setShowProfile={setShowProfile}
            msgReportDate={msgReportDate}
            msgPeriod={msgPeriod}
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
