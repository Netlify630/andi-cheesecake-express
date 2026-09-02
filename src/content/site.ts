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
      "Hello! I'm Andie, a home-goods baker! The first time I tried a cheesecake, I was in Turkey, and I loved it. I went back for thirds. After that, cheesecake has kind of stuck with me.\n\nI had always wanted to try and make a cheesecake, but I was running a different sourdough treats business, and it always felt like too much. At the time, I was looking for a way to expand my business.\n\nThen we went to Kauai. A beautiful island in Hawaii, and it was there that I got my spark of inspiration. There was a small cheesecake self-serve fridge that served the best poi lilikoi cheesecake. After that, the spark bloomed. I wanted to make a self-serve fridge here, in Idaho. So I did.",
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
