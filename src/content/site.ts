// ─────────────────────────────────────────────────────────────
// SITE INFO — edit your location, baker, and vote options here.
// ─────────────────────────────────────────────────────────────

export const site = {
  location: {
    addressLine1: "14031 Silver Ridge Rd",
    addressLine2: "Caldwell, ID\u00A083605",
    note: "Look for the fridge on the porch by the round-about.",
    mapsUrl: "",
  },
  payment: {
    methods: "Venmo or cash only",
    venmoHandle: "@Andielicious",
  },
  contactEmail: "andieliciouscheesecake@gmail.com",

  // Baker bio — swap in your own photo at src/assets/baker.jpg and update
  // the import in src/routes/index.tsx (BakerSection).
  baker: {
    name: "Andie",
    role: "Baker · Owner",
    bio:
      "Hi! I'm Andie — a home baker turned neighborhood cheesecake lady. What started as Thursday-afternoon baking for friends is now the little self-serve fridge you see today. Every slice is made from scratch, in small batches, with real cream cheese, real vanilla, and a whole lot of love.",
  },

  // Flavor vote — the flavors people can vote on for a future rotating slot.
  // The `slug` is the stable id stored in the database. Edit the labels or
  // add/remove flavors freely.
  voteFlavors: [
    { slug: "biscoff", label: "Biscoff Cookie Butter", emoji: "🍪" },
    { slug: "lemon-blueberry", label: "Lemon Blueberry", emoji: "🫐" },
    { slug: "salted-caramel", label: "Salted Caramel", emoji: "🍯" },
    { slug: "pumpkin-spice", label: "Pumpkin Spice", emoji: "🎃" },
    { slug: "raspberry-swirl", label: "Raspberry Swirl", emoji: "🍓" },
    { slug: "peanut-butter", label: "Peanut Butter Cup", emoji: "🥜" },
  ],
};
