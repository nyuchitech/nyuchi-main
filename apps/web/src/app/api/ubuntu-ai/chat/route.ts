/**
 * 🇿🇼 Ubuntu AI Chat API Route
 * "I am because we are" - AI assistant with African cultural intelligence
 */

import { NextRequest, NextResponse } from 'next/server';

const UBUNTU_PROMPTS = {
  greeting: `You are Ubuntu AI, embodying the African philosophy "I am because we are."
Your purpose is to help African entrepreneurs and businesses succeed together.

Key principles:
1. Prioritize community benefit over individual gain
2. Consider cultural contexts and local opportunities
3. Emphasize collaboration and mutual support
4. Connect complementary skills and resources
5. Promote cross-industry innovation

Always respond with warmth and wisdom, grounded in Ubuntu philosophy.`,
  collaboration: `When suggesting collaborations, focus on:
- Mutual benefit and community growth
- Cultural contexts and local opportunities
- Shared success over individual gain
- Complementary skills and resources`,
};

// Export for potential future use
export { UBUNTU_PROMPTS };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // For now, provide intelligent responses without external AI
    // This can be upgraded to use Cloudflare AI or Claude API later
    const response = generateUbuntuResponse(message, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Ubuntu AI error:', error);
    return NextResponse.json(
      { error: 'Ubuntu AI is temporarily unavailable' },
      { status: 500 }
    );
  }
}

function generateUbuntuResponse(message: string, _context?: { communityId?: string; conversationHistory?: unknown[] }) {
  const lowerMessage = message.toLowerCase();

  // Business challenges
  if (lowerMessage.includes('business') || lowerMessage.includes('challenge')) {
    return {
      content: `In the Ubuntu spirit, every business challenge is an opportunity for community strength. Here's how we can help:

1. **Share Your Challenge** - Our community has diverse expertise
2. **Find Partners** - Connect with businesses that complement yours
3. **Learn Together** - Access guides and success stories
4. **Grow Together** - Your success lifts the whole community

What specific challenge would you like to explore? Remember: "I am because we are."`,
      ubuntu_principle: 'Community Support',
      community_impact: 'Strengthening African business networks',
      follow_up_suggestions: [
        'I need help with marketing',
        'Looking for investment',
        'Want to expand to new markets',
      ],
    };
  }

  // Collaboration
  if (lowerMessage.includes('collaboration') || lowerMessage.includes('partner')) {
    return {
      content: `Ubuntu teaches us that together we achieve more. Here are collaboration opportunities:

🤝 **Cross-Industry Partnerships** - Connect tech with agriculture, finance with tourism
🌍 **Regional Expansion** - Partner with businesses in different African countries
💡 **Knowledge Exchange** - Share expertise and learn from others
🚀 **Joint Ventures** - Combine resources for bigger projects

The Nyuchi directory has businesses ready to collaborate. Should I help you find potential partners?`,
      ubuntu_principle: 'Collective Success',
      community_impact: 'Building Pan-African business bridges',
      follow_up_suggestions: [
        'Find partners in my industry',
        'Connect with international businesses',
        'Start a joint project',
      ],
    };
  }

  // Community
  if (lowerMessage.includes('community') || lowerMessage.includes('strengthen')) {
    return {
      content: `The Ubuntu community thrives when each member contributes:

📝 **Share Knowledge** - Write articles, guides, or success stories (+100 Ubuntu points)
🏢 **List Your Business** - Join the directory (+75 Ubuntu points)
🤝 **Help Others** - Answer questions, make introductions (+50 Ubuntu points)
🎉 **Celebrate Wins** - Recognize community achievements (+25 Ubuntu points)

Your current Ubuntu Score reflects your community impact. How would you like to contribute today?`,
      ubuntu_principle: 'Mutual Growth',
      community_impact: 'Elevating the entire ecosystem',
      follow_up_suggestions: [
        'How do I earn Ubuntu points?',
        'Share my success story',
        'Help other entrepreneurs',
      ],
    };
  }

  // Travel
  if (lowerMessage.includes('travel') || lowerMessage.includes('destination')) {
    return {
      content: `Discover the beauty and business opportunities across Africa:

🌄 **Zimbabwe** - Victoria Falls, Great Zimbabwe, wildlife safaris
🦁 **Kenya** - Masai Mara, Nairobi tech hub, coastal experiences
🏔️ **South Africa** - Cape Town, Johannesburg, wine country
🏝️ **Tanzania** - Zanzibar, Serengeti, Mount Kilimanjaro

Our travel platform connects you with verified local guides and businesses. Would you like to explore a specific destination?`,
      ubuntu_principle: 'Pan-African Discovery',
      community_impact: 'Supporting local tourism businesses',
      follow_up_suggestions: [
        'Plan a Zimbabwe trip',
        'Find local tour guides',
        'Business travel recommendations',
      ],
    };
  }

  // Default response
  return {
    content: `Ubuntu greetings! "I am because we are."

I'm here to help you:
• **Connect** with African entrepreneurs and businesses
• **Discover** collaboration opportunities
• **Grow** your business with community support
• **Explore** African destinations and markets

How can I support your journey today?`,
    ubuntu_principle: 'Ubuntu Welcome',
    community_impact: 'Building connections across Africa',
    follow_up_suggestions: [
      'Tell me about business challenges',
      'Find collaboration opportunities',
      'How to strengthen community',
    ],
  };
}
