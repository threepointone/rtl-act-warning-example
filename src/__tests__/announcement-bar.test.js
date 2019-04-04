import React from 'react';
import { render, act, fireEvent, cleanup, wait, waitForElement } from 'react-testing-library';

import 'jest-dom/extend-expect';

import AnnouncementBar from '../announcement-bar';

import mockAxios from 'axios';

jest.mock('axios');

const statusOkMessageLosant = {
    data: {
        page: {
            id: 'lgbfddhklcdg',
            name: 'Losant',
            url: 'http://status.losant.com',
            time_zone: 'America/New_York',
            updated_at: '2019-01-18T18:47:13.392-05:00'
        },
        status: {
            indicator: 'none',
            description: 'All Systems Operational'
        }
    }
};

const statusBadMessageLosant = {
    data: {
        page: {
            id: 'lgbfddhklcdg',
            name: 'Losant',
            url: 'http://status.losant.com',
            time_zone: 'America/New_York',
            updated_at: '2019-01-18T18:47:13.392-05:00'
        },
        status: {
            indicator: 'danger',
            description: 'All Systems Not Operational'
        }
    }
};

const statusOkMessageAtlassian = {
    data: {
        page: {
            id: 'bqlf8qjztdtr',
            name: 'Atlassian',
            url: 'http://status.losant.com',
            time_zone: 'America/New_York',
            updated_at: '2019-01-18T18:47:13.392-05:00'
        },
        status: {
            indicator: 'none',
            description: 'All Systems Operational'
        }
    }
};

const statusBadMessageAtlassian = {
    data: {
        page: {
            id: 'bqlf8qjztdtr',
            name: 'Atlassian',
            url: 'http://status.losant.com',
            time_zone: 'America/New_York',
            updated_at: '2019-01-18T18:47:13.392-05:00'
        },
        status: {
            indicator: 'danger',
            description: 'All Systems Not Operational'
        }
    }
};

describe('<AnnouncementBar />', () => {

    beforeEach(() => {
        mockAxios.get.mockReset();
    });

    afterEach(() => {
        jest.clearAllTimers();
        cleanup();
    });


    // THIS PASSES
    it('renders nothing if the third-party calls have not completed', async () => {
        mockAxios.get.mockImplementation((args) => {
            if (args === `https://bqlf8qjztdtr.statuspage.io/api/v2/status.json`) {
                return new Promise(() => { }); // return Promise in pending state (network request made but no response yet)
            }
            if (args === 'https://lgbfddhklcdg.statuspage.io/api/v2/status.json') {
                return new Promise(() => { }); // return Promise in pending state (network request made but no response yet)
            }
        });

        let container, unmount;
        act(() => {
            ({ container, unmount } = render(<AnnouncementBar />));
        });
        // await flushPromises();
        expect(mockAxios.get).toHaveBeenCalledTimes(2);
        expect(mockAxios.get).toHaveBeenCalledWith('https://lgbfddhklcdg.statuspage.io/api/v2/status.json');
        expect(mockAxios.get).toHaveBeenCalledWith(`https://bqlf8qjztdtr.statuspage.io/api/v2/status.json`);
        expect(container.firstChild).toEqual(null);
        unmount();
    });

    // THIS DOESN'T PASS
    it('renders an api status message if there is one', async () => {
        mockAxios.get.mockImplementation((args) => {
            if (args === `https://bqlf8qjztdtr.statuspage.io/api/v2/status.json`) {
                return Promise.resolve(statusOkMessageAtlassian);
            }
            if (args === 'https://lgbfddhklcdg.statuspage.io/api/v2/status.json') {
                return Promise.resolve(statusOkMessageLosant);
            }
        });

        const { getByText, asFragment, queryByText } = render(
            <AnnouncementBar />
        );


        // This passes BUT gives warnings about act
        // await wait(() => getByText('Losant: All Systems Operational'));

        // this returns -  Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.
        await act(async () => {
            await wait(() => getByText('Losant: All Systems Operational'));
        });

        // check API calls
        expect(mockAxios.get).toHaveBeenCalledTimes(2);
        expect(mockAxios.get).toHaveBeenCalledWith('https://lgbfddhklcdg.statuspage.io/api/v2/status.json');
        expect(mockAxios.get).toHaveBeenCalledWith(`https://bqlf8qjztdtr.statuspage.io/api/v2/status.json`);

        // check what was rendered
        expect(getByText('Losant: All Systems Operational')).toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();

        // make sure Atlassian status wasnt rendered
        const BlogPost = queryByText('Atlassian: All Systems Operational');
        expect(BlogPost).toBeNull();
    });
});
