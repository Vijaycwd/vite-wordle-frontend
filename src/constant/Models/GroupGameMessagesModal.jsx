import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import GroupGameMessages from "../../pages/GroupLeaderboard/GroupGameMessages";

function GroupGameMessagesModal({ groupId, gameName, periodType, periodDate, userId }) {
  const [show, setShow] = useState(false);

  return (
    <>
      {/* Button to open modal */}
      <Button className={`${gameName}-btn my-3 d-block m-auto`} onClick={() => setShow(true)}>
        Messages {periodDate}
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Messages - ({periodDate} {periodType})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GroupGameMessages
            groupId={groupId}
            gameName={gameName}
            periodType={periodType}
            periodDate={periodDate}
            userId={userId}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default GroupGameMessagesModal;
