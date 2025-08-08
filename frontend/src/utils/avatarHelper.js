export const getAvatarFor = (wa_id) => {
    // This function returns a specific avatar based on the contact's ID
    switch (wa_id) {
        case '919937320320': // Ravi Kumar's wa_id
            return '/ravi-kumar.PNG';
        case '929967673820': // Neha Joshi's wa_id
            return '/neha-joshi.PNG';
        default:
            // Return a default placeholder if no match is found
            return '/avatar-placeholder.png';
    }
};