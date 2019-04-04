import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SYSTEM_STATUS_INTERVAL = 300000; // fetch every 5 minutes

const AnnouncementBar = ({ whiteLabel, lastSeenBlogPostTime, owner, currentUser }) => {
    const [secondStatus, setSecondStatus] = useState({ wasCalled: false, item: null });
    const [firstStatus, setFirstStatus] = useState({ wasCalled: false, item: null });

    useEffect(() => { // get platform update
      axios.get('https://bqlf8qjztdtr.statuspage.io/api/v2/status.json')
        .then((result) => {
          if (!result) {
            setFirstStatus({ wasCalled: true, item: null });
            return;
          }
          setFirstStatus({ wasCalled: true, item: result.data });
        });
    }, []);

    useEffect(() => { // get system status
        const fetchSecondStatus = () => {
          axios.get('https://lgbfddhklcdg.statuspage.io/api/v2/status.json')
            .then((result) => {
              if (!result) {
                setSecondStatus({ wasCalled: true, item: null });
                return;
              }
              setSecondStatus({ wasCalled: true, item: result.data });
            });
        };
        fetchSecondStatus();
        const interval = setInterval(fetchSecondStatus, SYSTEM_STATUS_INTERVAL); // fetch the system status on a recurring basis
        return () => {
          clearInterval(interval);
        };
    }, []);

    if (secondStatus.wasCalled && firstStatus.wasCalled) {
        const status = secondStatus.item || firstStatus.item; // second item takes priority over first item
        if (status) {
          return <div>{status.page.name}: {status.status.description}</div>
        }
    }
    return null;
};

export default AnnouncementBar;
