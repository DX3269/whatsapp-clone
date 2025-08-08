import React from 'react';

const StatusIcon = ({ status }) => {
    if (status === 'read') {
        return (
            <svg viewBox="0 0 18 18" height="12" width="12" preserveAspectRatio="xMidYMid meet" version="1.1" x="0px" y="0px">
                <path fill="#4FC3F7" d="M17.399,5.343l-1.414-1.414l-8.358,8.358l-0.707-0.707l-2.121,2.121l2.828,2.828L17.399,5.343z M12.63,3.929 l-1.414-1.414l-6.236,6.236l1.414,1.414L12.63,3.929z"></path>
            </svg>
        );
    }
    if (status === 'delivered') {
        return (
            <svg viewBox="0 0 18 18" height="12" width="12" preserveAspectRatio="xMidYMid meet" version="1.1" x="0px" y="0px">
                <path fill="#667781" d="M17.399,5.343l-1.414-1.414l-8.358,8.358l-0.707-0.707l-2.121,2.121l2.828,2.828L17.399,5.343z M12.63,3.929 l-1.414-1.414l-6.236,6.236l1.414,1.414L12.63,3.929z"></path>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 18 18" height="12" width="12" preserveAspectRatio="xMidYMid meet" version="1.1" x="0px" y="0px">
            <path fill="#667781" d="M16.699,5.343l-1.414-1.414l-8.358,8.358L4.806,10.166l-2.121,2.121l4.242,4.242L16.699,5.343z"></path>
        </svg>
    );
};

export default StatusIcon;