import React from 'react'
import { Button } from 'react-bootstrap';

function InviteGroupAndSite({ groupId }) {
    const userAuthData = JSON.parse(localStorage.getItem('auth')) || {};

    const inviteFriends = async () => {
        const frontendURL = `${window.location.origin}?group_id=${groupId}`;
        const fullName = userAuthData.firstname && userAuthData.lastname
        ? `${userAuthData.firstname} ${userAuthData.lastname}`
        : 'A friend';

        const message = `${fullName} has invited you to create an account on WordGAMLE.com\n\n👉 Enter ‘Casa’ (case sensitive) to get into the site!`;

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
        <Button className="px-5 mt-3" onClick={inviteFriends}>
            Invite Friends to Site & Group
        </Button>
    )
    }

export default InviteGroupAndSite