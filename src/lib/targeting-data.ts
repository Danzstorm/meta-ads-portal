
export interface TargetingOption {
    id: string;
    name: string;
    type: 'interest' | 'behavior' | 'demographic';
    audience_size?: string;
}

export const TARGETING_DATA: TargetingOption[] = [
    // Interests - Business
    { id: "1", name: "Marketing", type: "interest", audience_size: "350M" },
    { id: "2", name: "Digital marketing", type: "interest", audience_size: "150M" },
    { id: "3", name: "Social media marketing", type: "interest", audience_size: "120M" },
    { id: "4", name: "Entrepreneurship", type: "interest", audience_size: "450M" },
    { id: "5", name: "Small business", type: "interest", audience_size: "200M" },
    { id: "6", name: "Advertising", type: "interest", audience_size: "180M" },
    { id: "7", name: "Online advertising", type: "interest", audience_size: "90M" },

    // Interests - Technology
    { id: "8", name: "Software engineering", type: "interest", audience_size: "50M" },
    { id: "9", name: "Web development", type: "interest", audience_size: "80M" },
    { id: "10", name: "Artificial intelligence", type: "interest", audience_size: "60M" },

    // Interests - Hobbies
    { id: "11", name: "Travel", type: "interest", audience_size: "800M" },
    { id: "12", name: "Fitness", type: "interest", audience_size: "500M" },
    { id: "13", name: "Cooking", type: "interest", audience_size: "400M" },

    // Behaviors
    { id: "14", name: "Engaged shoppers", type: "behavior", audience_size: "300M" },
    { id: "15", name: "Frequent travelers", type: "behavior", audience_size: "100M" },
    { id: "16", name: "Facebook Page admins", type: "behavior", audience_size: "50M" },
    { id: "17", name: "Small business owners", type: "behavior", audience_size: "40M" },

    // Demographics
    { id: "18", name: "Parents", type: "demographic", audience_size: "250M" },
    { id: "19", name: "College grads", type: "demographic", audience_size: "300M" },
];
