(function (global) {
  const SMS = {
    sms1: {
      type: "sms",
      sender: "+1 (737) 555-0142",
      body:
        "USPS: Your package could not be delivered due to an incomplete address. " +
        "Please confirm your details and pay the $2.99 redelivery fee at " +
        "usps-redelivery-portal.cc/track to avoid return.",
      isPhishing: true,
      explain:
        "USPS does not text you to collect a redelivery fee, and the link uses a " +
        "lookalike domain on a suspicious top-level domain.",
    },
    sms2: {
      type: "sms",
      sender: "+1 (415) 555-0199",
      body:
        "Bank of Amrica Alert: We detected unusual activity on your card. " +
        "Verify your identity now to avoid a freeze: bankofamerica-secure.support/verify",
      isPhishing: true,
      explain:
        "'Amrica' is misspelled and the domain is a lookalike. Banks won't ask " +
        "you to verify identity through a text link.",
    },
    sms3: {
      type: "sms",
      sender: "729-725 (Verify)",
      body: "Your Google verification code is 482917. Do not share this code with anyone.",
      isPhishing: false,
      explain:
        "A real Google short code, no link, and an explicit 'don't share' note. " +
        "If you requested the sign-in, this is normal.",
    },
    sms4: {
      type: "sms",
      sender: "+1 (302) 555-0173",
      body:
        "Congrats! You've been selected for a $1,000 Amazon gift card. " +
        "Claim within 24 hours: amzn-rewards.top/claim?id=8821",
      isPhishing: true,
      explain:
        "Unsolicited prize + 24-hour pressure + lookalike domain on a .top TLD = scam.",
    },
    sms5: {
      type: "sms",
      sender: "AA-FLT (24411)",
      body:
        "American Airlines: Your flight AA1283 to DFW is now departing from " +
        "Gate C12. Boarding at 14:30. View your boarding pass in the app.",
      isPhishing: false,
      explain:
        "Registered short code, specific flight detail, no link to click that's " +
        "the legit airline pattern.",
    },
  };

  const EMAIL = {
    em1: {
      type: "email",
      fromName: "GitHub",
      fromAddress: "noreply@github.com",
      subject: "[GitHub] A new SSH key was added to your account",
      body:
        "Hey Guest,\n\nA new SSH key was added to your account.\n\n" +
        "If you didn't add this key, you can remove it and reset your password " +
        "by visiting https://github.com/settings/keys.\n\nThanks,\nThe GitHub Team",
      isPhishing: false,
      explain:
        "Sender domain is github.com, link is github.com, message tells you what " +
        "to do if it wasn't you instead of demanding action.",
    },
    em2: {
      type: "email",
      fromName: "Apple Support",
      fromAddress: "support@apple-id-verify.com",
      subject: "Your Apple ID has been locked",
      body:
        "Dear Customer,\n\nYour Apple ID has been temporarily locked due to " +
        "suspicious activity. To restore access, you must verify your account " +
        "within 24 hours or it will be permanently disabled.\n\n" +
        "Click here to verify: http://apple-id-verify.com/unlock\n\n" +
        "Apple Support Team",
      isPhishing: true,
      explain:
        "Sender domain isn't apple.com, generic 'Dear Customer', urgency, and " +
        "permanent-disable threat. Real Apple emails come from apple.com.",
    },
    em3: {
      type: "email",
      fromName: "Mark Stevens, CEO",
      fromAddress: "mark.stevens.ceo@gmail.com",
      subject: "Quick favor - need this done before my flight",
      body:
        "Hi,\n\nI'm boarding a flight in 20 minutes and need a favor. Can you " +
        "pick up five $200 Apple gift cards for a client thank-you? Scratch off " +
        "the backs and email me the codes ASAP. I'll reimburse you when I land.\n\n" +
        "Thanks,\nMark",
      isPhishing: true,
      explain:
        "Classic CEO-fraud / whaling. Personal gmail address, urgency, and the " +
        "gift-card ask is a textbook scam pattern.",
    },
    em4: {
      type: "email",
      fromName: "Spotify",
      fromAddress: "no-reply@spotify.com",
      subject: "Your June receipt from Spotify",
      body:
        "Hi Leo,\n\nThanks for being a Premium member. Your subscription " +
        "renewed on June 1 for $10.99. View your receipt or manage your plan " +
        "anytime at spotify.com/account.\n\n- The Spotify team",
      isPhishing: false,
      explain:
        "Sender is spotify.com, link is spotify.com, named greeting, no urgency, " +
        "no credential request a normal transactional email.",
    },
    em5: {
      type: "email",
      fromName: "DocuSign",
      fromAddress: "service@docu-sign-secure.net",
      subject: "Document waiting for your signature",
      body:
        "Hello,\n\nYou have a confidential document awaiting your signature. " +
        "It will expire in 24 hours.\n\nView and sign now: " +
        "http://docu-sign-secure.net/sign/x8H22\n\nDocuSign Service Team",
      isPhishing: true,
      explain:
        "Real DocuSign comes from docusign.com or docusign.net, not a hyphenated " +
        "lookalike. Generic greeting + 24-hour expiry is the giveaway.",
    },
  };

  const smsList = Object.values(SMS);
  const emailList = Object.values(EMAIL);

  const catalog = [
    {
      slug: "smishing",
      title: "Smishing",
      description: "Five SMS scenarios.",
      durationMin: 5,
      questions: smsList,
    },
    {
      slug: "email-phishing",
      title: "Email Phishing",
      description: "Five Gmail scenarios.",
      durationMin: 8,
      questions: emailList,
    },
    {
      slug: "mixed-phishing",
      title: "Mixed Phishing",
      description: "Texts and emails mixed.",
      durationMin: 10,
      questions: [
        SMS.sms1,
        EMAIL.em2,
        SMS.sms3,
        EMAIL.em3,
        SMS.sms4,
        EMAIL.em4,
        SMS.sms5,
        EMAIL.em5,
      ],
    },
  ];

  global.PhishyCourses = { catalog };
})(window);
