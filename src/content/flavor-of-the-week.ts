// ─────────────────────────────────────────────────────────────
// FLAVOR OF THE WEEK
// Edit this file each week to update the rotating flavor on the site.
//
// To change the photo:
//   1. Drop your new photo into: src/assets/flavor-of-the-week.jpg
//      (keep the same filename, or update the `image` import below)
//   2. Save. That's it.
// ─────────────────────────────────────────────────────────────

import flavorImage from "@/assets/strawberry-cheesecake.png";

export const flavorOfTheWeek = {
  // The flavor name (shown as the headline)
  name: "Strawberry Compote",

  // A short, tasty description (1–2 sentences)
  description:
    "Cream cheese kissed with slow-roasted strawberries and a whisper of vanilla. Only around this week.",

  // Optional little note above the name (e.g. week or date)
  weekLabel: "This week only",

  // The photo — replace src/assets/flavor-of-the-week.jpg with your own pic
  image: flavorImage,

  // Set to false to hide the whole "Flavor of the Week" spotlight section
  visible: true,
};
