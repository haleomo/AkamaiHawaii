export interface LocationGreeting {
  greeting: string;
  description: string;
  timeContext: string;
}

export function getLocationBasedGreeting(): LocationGreeting {
  const now = new Date();
  const hour = now.getHours();
  
  // Determine time of day
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  // Hawaiian greetings based on time of day
  const greetings = {
    morning: {
      greeting: "Aloha Kakahiaka! Good Morning!",
      description: "Start your Hawaiian adventure with our digital agriculture declaration. The islands await your safe arrival.",
      timeContext: "Perfect timing to complete your declaration before your flight!"
    },
    afternoon: {
      greeting: "Aloha ʻAuinalā! Good Afternoon!",
      description: "Welcome to your Hawaii agriculture declaration. Help us protect our beautiful islands' ecosystem.",
      timeContext: "Great time to get your paperwork ready for paradise!"
    },
    evening: {
      greeting: "Aloha Ahiahi! Good Evening!",
      description: "Prepare for your Hawaiian journey with this mandatory agriculture declaration form.",
      timeContext: "Evening is a wonderful time to plan your island adventure!"
    },
    night: {
      greeting: "Aloha Pō! Good Evening!",
      description: "Even under the island stars, we're here to help you complete your agriculture declaration.",
      timeContext: "Late night travel planning? We've got you covered!"
    }
  };

  return greetings[timeOfDay];
}

export function getTimeBasedMessage(): string {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Starting your day early? That's the island spirit!";
  } else if (hour >= 12 && hour < 17) {
    return "Perfect timing for your Hawaii travel preparations!";
  } else if (hour >= 17 && hour < 21) {
    return "Evening planning for your tropical getaway!";
  } else {
    return "Preparing for paradise under the moonlight!";
  }
}

export function formatLocalTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZoneName: 'short'
  });
}