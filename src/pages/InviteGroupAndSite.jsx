import React from 'react'
import { Button } from 'react-bootstrap';

function InviteGroupAndSite({ groupId }) {
    const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};

    const inviteFriends = async () => {
        const encryptedGroupId = btoa(groupId);
        const frontendURL = `${window.location.origin}?group_id=${encryptedGroupId}`;
        const fullName = userAuthData.firstname && userAuthData.lastname
        ? `${userAuthData.firstname} ${userAuthData.lastname}`
        : 'A friend';
        const groupText = encryptedGroupId ? ` and join a Group` : '';
        const message = `${fullName} has invited you to create an account on WordGAMLE.com*${groupText}.\n\n👉 *enter ‘Casa’ (case sensitive) to get into the site!`;

        const shareData = {
            title: 'Join WordGAMLE!',
            text: message,
            url: frontendURL,
        };

        if (navigator.share) {
            console.log(message);
            try {
            await navigator.share(shareData);
            
            } catch (err) {
            console.error('Share failed:', err);
            }
        } else {
            try {
            await navigator.clipboard.writeText(`${message}\n${shareData.url}`);
            alert('Invite message copied to clipboard!');
            } catch (err) {
            alert('Could not copy. Please share manually.');
            }
        }
    };
    return (
        <Button className=" mb-2 w-100" onClick={inviteFriends}>
            Invite Friends to Site & Group
        </Button>
    )
    }

export default InviteGroupAndSite