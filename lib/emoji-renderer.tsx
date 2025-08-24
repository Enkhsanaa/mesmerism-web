import React from "react";

interface CustomEmoji {
  name: string;
  url: string;
  keywords?: string[];
}

// Same custom emojis as in the picker - you might want to move this to a shared constants file
const CUSTOM_EMOJIS: CustomEmoji[] = [
  {
    name: "madlittlecat",
    keywords: ["catJAM"],
    url: "https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/3x.webp",
  },
  {
    name: "m3t4m0rf",
    keywords: ["KEKW"],
    url: "https://cdn.betterttv.net/emote/5e9c6c187e090362f8b0b9e8/3x.webp",
  },
  {
    name: "receprical",
    keywords: ["NOOO"],
    url: "https://cdn.betterttv.net/emote/5fd1610acbd462462d56cd7d/3x.webp",
  },
  {
    name: "lul",
    keywords: ["lul"],
    url: "https://cdn.betterttv.net/emote/5dc79d1b27360247dd6516ec/3x.webp",
  },
  {
    name: "kappa",
    keywords: ["kappa"],
    url: "https://cdn.betterttv.net/emote/61f2f17c06fd6a9f5be2630a/3x.webp",
  },
  {
    name: "thiagokeyz",
    keywords: ["Cinema"],
    url: "https://cdn.betterttv.net/emote/656aa21f807721a57bffd6fc/3x.webp",
  },
  {
    name: "monkasen",
    keywords: ["monkaS"],
    url: "https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/3x.webp",
  },
  {
    name: "worthlessvoid",
    keywords: ["OMEGALUL"],
    url: "https://cdn.betterttv.net/emote/583089f4737a8e61abb0186b/3x.webp",
  },
  {
    name: "heatwave69",
    keywords: ["LookUp"],
    url: "https://cdn.betterttv.net/emote/6300211aecbd4181542464cb/3x.webp",
  },
  {
    name: "turtlemaw",
    keywords: ["Clap"],
    url: "https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/3x.webp",
  },
  {
    name: "redshell",
    keywords: ["Sadge"],
    url: "https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/3x.webp",
  },
  {
    name: "ethynwithay",
    keywords: ["popCat"],
    url: "https://cdn.betterttv.net/emote/5fa8f232eca18f6455c2b2e1/3x.webp",
  },
  {
    name: "helloboat",
    keywords: ["EZ"],
    url: "https://cdn.betterttv.net/emote/5590b223b344e2c42a9e28e3/3x.webp",
  },
  {
    name: "madsheep_",
    keywords: ["Lizard"],
    url: "https://cdn.betterttv.net/emote/68918dac50a868b5cc2b9d37/3x.webp",
  },
  {
    name: "deadyz",
    keywords: ["catKISS"],
    url: "https://cdn.betterttv.net/emote/5f455410b2efd65d77e8cb14/3x.webp",
  },
  {
    name: "benjy",
    keywords: ["HUHH"],
    url: "https://cdn.betterttv.net/emote/6220c51b06fd6a9f5be613b4/3x.webp",
  },
  {
    name: "verbalsilence",
    keywords: ["modCheck"],
    url: "https://cdn.betterttv.net/emote/5d7eefb7c0652668c9e4d394/3x.webp",
  },
  {
    name: "atoxiv",
    keywords: ["HUHH"],
    url: "https://cdn.betterttv.net/emote/61cf4c6ec8cc7f36d52b27a9/3x.webp",
  },
  {
    name: "hannyarosie",
    keywords: ["GIGACHAD"],
    url: "https://cdn.betterttv.net/emote/609431bc39b5010444d0cbdc/3x.webp",
  },
  {
    name: "to_ot",
    keywords: ["POGGERS"],
    url: "https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/3x.webp",
  },
  {
    name: "daledo_",
    keywords: ["ratJAM"],
    url: "https://cdn.betterttv.net/emote/5f43037db2efd65d77e8a88f/3x.webp",
  },
  {
    name: "kkomrade",
    keywords: ["PepeLaugh"],
    url: "https://cdn.betterttv.net/emote/5c548025009a2e73916b3a37/3x.webp",
  },
  {
    name: "delphoxtube",
    keywords: ["SNIFFA"],
    url: "https://cdn.betterttv.net/emote/60be7fa7f8b3f62601c3a4b2/3x.webp",
  },
  {
    name: "akumzz",
    keywords: ["CAUGHT"],
    url: "https://cdn.betterttv.net/emote/6518b687fc204fb5a94ca81d/3x.webp",
  },
  {
    name: "kabrewie",
    keywords: ["YesYes"],
    url: "https://cdn.betterttv.net/emote/608c226c39b5010444d09256/3x.webp",
  },
  {
    name: "eniemay",
    keywords: ["Nono"],
    url: "https://cdn.betterttv.net/emote/624cc9e93c6f14b6884482e3/3x.webp",
  },
  {
    name: "wakeuprumi",
    keywords: ["DonoWall"],
    url: "https://cdn.betterttv.net/emote/5efcd82551e3910deed68751/3x.webp",
  },
  {
    name: "koorichi",
    keywords: ["blobDance"],
    url: "https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/3x.webp",
  },
  {
    name: "p3ntaz",
    keywords: ["PepeHands"],
    url: "https://cdn.betterttv.net/emote/59f27b3f4ebd8047f54dee29/3x.webp",
  },
  {
    name: "badaba",
    keywords: ["LETSGOOO"],
    url: "https://cdn.betterttv.net/emote/5f7cd139ce8bc74a94247828/3x.webp",
  },
  {
    name: "neothemod",
    keywords: ["bongoTap"],
    url: "https://cdn.betterttv.net/emote/5ba6d5ba6ee0c23989d52b10/3x.webp",
  },
  {
    name: "nyakawaiiidesu",
    keywords: ["HIII"],
    url: "https://cdn.betterttv.net/emote/65c22781eb58e412d8b43357/3x.webp",
  },
  {
    name: "sharkie_",
    keywords: ["peepoClap"],
    url: "https://cdn.betterttv.net/emote/5d38aaa592fc550c2d5996b8/3x.webp",
  },
  {
    name: "fob911",
    keywords: ["ThisIsFine"],
    url: "https://cdn.betterttv.net/emote/5e2914861df9195f1a4cd411/3x.webp",
  },
  {
    name: "eduardogatoo",
    keywords: ["BOOBA"],
    url: "https://cdn.betterttv.net/emote/5fa99424eca18f6455c2bca5/3x.webp",
  },
  {
    name: "maikeru",
    keywords: ["VIBE"],
    url: "https://cdn.betterttv.net/emote/6228bfe606fd6a9f5be69c39/3x.webp",
  },
  {
    name: "default5ettings",
    keywords: ["peepoLeave"],
    url: "https://cdn.betterttv.net/emote/5d324913ff6ed36801311fd2/3x.webp",
  },
  {
    name: "botkz",
    keywords: ["NERD"],
    url: "https://cdn.betterttv.net/emote/631b768b8d546373770709f8/3x.webp",
  },
  {
    name: "shakothewacko",
    keywords: ["pepeJAM"],
    url: "https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/3x.webp",
  },
  {
    name: "extoplasmic",
    keywords: ["Cooked"],
    url: "https://cdn.betterttv.net/emote/67d23d23c5eb2d34c0f73715/3x.webp",
  },
  {
    name: "verbalsilence-pepe",
    keywords: ["NODDERS"],
    url: "https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x.webp",
  },
  {
    name: "orangemorange",
    keywords: ["PETTHEMODS"],
    url: "https://cdn.betterttv.net/emote/5f24435d713a6144748a91c7/3x.webp",
  },
  {
    name: "aldo_geo",
    keywords: ["WAJAJA"],
    url: "https://cdn.betterttv.net/emote/63f40299d4a15946cd2e61dc/3x.webp",
  },
  {
    name: "czharu",
    keywords: ["Prayge"],
    url: "https://cdn.betterttv.net/emote/5f3ef6123212445d6fb49f1a/3x.webp",
  },
  {
    name: "dookiejar",
    keywords: ["Classic"],
    url: "https://cdn.betterttv.net/emote/635006ec9bb828a9f0d408d7/3x.webp",
  },
  {
    name: "mechmoder",
    keywords: ["COPIUM"],
    url: "https://cdn.betterttv.net/emote/5f64475bd7160803d895a112/3x.webp",
  },
  {
    name: "shinjidude",
    keywords: ["peepoShy"],
    url: "https://cdn.betterttv.net/emote/5eaa12a074046462f768344b/3x.webp",
  },
  {
    name: "coobiexd",
    keywords: ["pressF"],
    url: "https://cdn.betterttv.net/emote/5c857788f779543bcdf37124/3x.webp",
  },
  {
    name: "teyn",
    keywords: ["Pog"],
    url: "https://cdn.betterttv.net/emote/5ff827395ef7d10c7912c106/3x.webp",
  },
  {
    name: "dermaneq19",
    keywords: ["SUSSY"],
    url: "https://cdn.betterttv.net/emote/6197ab6f54f3344f8806589d/3x.webp",
  },
  {
    name: "xxxxxxxxxx420xxxxxxxxxx",
    keywords: ["WeSmart"],
    url: "https://cdn.betterttv.net/emote/5a311dd16405a95e4b0d4967/3x.webp",
  },
  {
    name: "onmarked",
    keywords: ["5Head"],
    url: "https://cdn.betterttv.net/emote/5d6096974932b21d9c332904/3x.webp",
  },
];
// Create a map for faster lookup
const EMOJI_MAP = new Map(CUSTOM_EMOJIS.map((emoji) => [emoji.name, emoji]));

export function renderMessageWithEmojis(text: string): React.ReactNode[] {
  // Regex to match custom emoji patterns like :kappa: or :pogchamp:
  const emojiRegex = /:([a-zA-Z0-9_]+):/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = emojiRegex.exec(text)) !== null) {
    const [fullMatch, emojiName] = match;
    const matchIndex = match.index;

    // Add text before the emoji
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    // Check if we have this custom emoji
    const customEmoji = EMOJI_MAP.get(emojiName.toLowerCase());
    if (customEmoji) {
      parts.push(
        <img
          key={`${emojiName}-${matchIndex}`}
          src={customEmoji.url}
          alt={`:${emojiName}:`}
          title={`:${emojiName}:`}
          className="inline-block w-5 h-5 object-contain mx-0.5 align-text-bottom"
          loading="lazy"
        />
      );
    } else {
      // If we don't have the emoji, just show the original text
      parts.push(fullMatch);
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function hasCustomEmojis(text: string): boolean {
  const emojiRegex = /:([a-zA-Z0-9_]+):/g;
  let match;

  while ((match = emojiRegex.exec(text)) !== null) {
    const [, emojiName] = match;
    if (EMOJI_MAP.has(emojiName.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export { CUSTOM_EMOJIS, EMOJI_MAP };
