
ALTER TABLE public.animal_stories
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS hero_narrative text,
  ADD COLUMN IF NOT EXISTS key_facts jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS behavior_insights text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS cultural_relevance text,
  ADD COLUMN IF NOT EXISTS swahili_name text,
  ADD COLUMN IF NOT EXISTS parks text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS hero_image text,
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}'::text[];

CREATE UNIQUE INDEX IF NOT EXISTS animal_stories_slug_key ON public.animal_stories(slug);
CREATE INDEX IF NOT EXISTS animal_stories_parks_gin ON public.animal_stories USING gin(parks);

UPDATE public.animal_stories SET
  slug = 'lion',
  swahili_name = 'Simba',
  hero_narrative = 'At dawn on the Mara plains, the grass holds its breath. A low, rolling roar carries six kilometers across the savanna — a king announcing he has survived another night. Lions are the only true social cats: prides of related lionesses, generations deep, hunting in choreographed silence while the males patrol borders written in scent. To watch a pride at a kill is to watch democracy and tyranny braided together — cubs tolerated, rivals exiled, queens ruling without crowns. They rest twenty hours a day not from laziness, but because every other hour costs everything.',
  key_facts = jsonb_build_object('speed','80 km/h','weight','190 kg','lifespan','12–16 yrs','habitat','Savanna, scrub','diet','Carnivore','status','Vulnerable'),
  behavior_insights = ARRAY[
    'Females do 85–90% of pride hunting, fanning out in coordinated arcs.',
    'A male coalition''s tenure averages just 2–3 years before being overthrown.',
    'Roars carry up to 8 km — a territorial broadcast, not aggression.',
    'Cubs are communally nursed; any lactating female may feed any cub in the pride.'
  ],
  cultural_relevance = 'In Maa, the lion is olng''atuny — a being of dignity. The Maasai moran rite once required proving courage before one, but today most communities partner with conservancies to protect prides instead. The lion appears on Kenya''s coat of arms; "Simba" means more than the animal — it names a kind of presence.',
  parks = ARRAY['Maasai Mara','Tsavo East','Tsavo West','Amboseli','Samburu','Laikipia']
WHERE name = 'Lion';

UPDATE public.animal_stories SET
  slug = 'elephant',
  swahili_name = 'Tembo',
  hero_narrative = 'An elephant matriarch can remember a waterhole she visited forty years ago, and lead her family there in a drought. Elephants mourn their dead, returning to bones, turning them gently with their trunks. They communicate in infrasound — vibrations through the ground — coordinating across kilometers without a sound a human can hear. In Amboseli, beneath Kilimanjaro''s snow, the great tuskers still walk: the last giants of an evolutionary lineage that taught the savanna how to be a savanna.',
  key_facts = jsonb_build_object('speed','40 km/h','weight','6,000 kg','lifespan','60–70 yrs','habitat','Savanna, forest','diet','Herbivore','status','Endangered'),
  behavior_insights = ARRAY[
    'Families are matriarchal — led by the oldest female, who holds the herd''s collective memory.',
    'They use 9+ distinct rumbles, plus seismic signals felt through sensitive foot pads.',
    'A single elephant disperses thousands of seeds daily, reshaping forests as they walk.',
    'Greeting ceremonies between reunited family members can last 10 minutes — trumpets, urination, intertwined trunks.'
  ],
  cultural_relevance = 'For the Kamba and Maa peoples, elephants are kin. Killing one was historically taboo outside of defense. Today, "Big Tusker" matriarchs like Craig and the late Tim are named individuals, mourned nationally. KWS rangers risk their lives to protect them; ivory is now publicly burned, not sold.',
  parks = ARRAY['Amboseli','Tsavo East','Tsavo West','Maasai Mara','Samburu','Aberdare']
WHERE name = 'Elephant';

UPDATE public.animal_stories SET
  slug = 'leopard',
  swahili_name = 'Chui',
  hero_narrative = 'You will not see the leopard. The leopard will see you, decide you are uninteresting, and stay. Of all the Big Five, chui is the ghost — solitary, nocturnal, the most adaptable big cat on Earth. A single leopard hauls a 70 kg impala vertically up a fig tree to keep it from lions and hyenas. They live closer to humans than any other large predator and we almost never know it. To spot a leopard draped on an acacia branch, tail twitching, is to be granted an audience.',
  key_facts = jsonb_build_object('speed','58 km/h','weight','60 kg','lifespan','12–17 yrs','habitat','Forest, rocky outcrops','diet','Carnivore','status','Vulnerable'),
  behavior_insights = ARRAY[
    'Pound-for-pound the strongest climber of the big cats — can lift 3x their body weight up a tree.',
    'Each rosette pattern is unique, like a fingerprint — used to ID individuals.',
    'They communicate with rasping "saw" calls, not roars.',
    'A leopard''s territory may overlap with several others; conflict is rare and ritualized.'
  ],
  cultural_relevance = 'Chui appears in Swahili coastal proverbs as the embodiment of patience: "Pole pole ndio mwendo" — slowly, slowly is the way. In Kikuyu lore the leopard is a teacher of stealth and self-sufficiency. Today the Mara North and Laikipia conservancies host some of the highest densities in Africa.',
  parks = ARRAY['Maasai Mara','Samburu','Laikipia','Tsavo East','Aberdare','Mount Kenya']
WHERE name = 'Leopard';

UPDATE public.animal_stories SET
  slug = 'rhino',
  swahili_name = 'Kifaru',
  hero_narrative = 'A rhino is older than the savanna itself — 50 million years of armored ancestry, walking. There are two species in Kenya: black rhino, browsers with hooked lips, sharp-tempered and rare; white rhino, grazers with square mouths, gentler and grouped. At Ol Pejeta, the last two northern white rhinos on Earth — Najin and Fatu — are guarded around the clock. Their species exists now only in laboratories and prayer. To stand near a rhino is to stand near deep time, and near a wound humans are still trying to close.',
  key_facts = jsonb_build_object('speed','55 km/h','weight','1,400 kg','lifespan','35–50 yrs','habitat','Savanna, grassland','diet','Herbivore','status','Critically Endangered'),
  behavior_insights = ARRAY[
    'Black rhinos are solitary; white rhinos form loose groups called "crashes".',
    'Eyesight is poor (~30m) but smell and hearing are exceptional.',
    'They mark territory with carefully placed dung middens — chemical bulletin boards.',
    'A horn is keratin, like a fingernail; it regrows if cut, which is why some are dehorned for protection.'
  ],
  cultural_relevance = 'Kifaru has become Kenya''s symbol of conservation itself. Lewa, Ol Pejeta, and Ol Jogi sanctuaries pioneered the world''s tightest anti-poaching protocols. Every calf born here is national news. The Maa name for the black rhino — emuny — is whispered carefully; this is an animal whose survival is no longer assumed.',
  parks = ARRAY['Lewa','Ol Pejeta','Nairobi National Park','Maasai Mara','Lake Nakuru']
WHERE name = 'Rhinoceros';

UPDATE public.animal_stories SET
  slug = 'buffalo',
  swahili_name = 'Nyati',
  hero_narrative = 'Old buffalo bulls have a name in the bush: dagga boys. Pushed out of the herd, caked in dried mud, they stand at waterholes and remember every offense. The Cape buffalo has killed more hunters than any other African animal — not from rage, but from precision. Herds of a thousand cross the Mara like a single thinking organism, and when a lion takes a calf, the herd will turn and hunt the lions back. Of the Big Five, nyati is the one that does not run.',
  key_facts = jsonb_build_object('speed','57 km/h','weight','900 kg','lifespan','18–22 yrs','habitat','Grassland, swamp','diet','Herbivore','status','Near Threatened'),
  behavior_insights = ARRAY[
    'Herds vote on direction — individuals face the way they want to travel; the majority wins.',
    'They will mob predators, including lions, to rescue a calf or wounded member.',
    'Lone males ("dagga boys") are statistically the most dangerous to humans — wary, solitary, decisive.',
    'A buffalo never forgets a threat; survivors of attacks have been recorded ambushing the same hunter weeks later.'
  ],
  cultural_relevance = 'For the Maa, nyati is the test — the animal that demands you respect its space without flinching. Buffalo herds shape the savanna by churning mud wallows that become dry-season waterholes for everything else. Their resilience makes them a quiet emblem of community strength.',
  parks = ARRAY['Maasai Mara','Lake Nakuru','Aberdare','Mount Kenya','Tsavo West','Meru']
WHERE name = 'Buffalo';

ALTER TABLE public.animal_stories ALTER COLUMN slug SET NOT NULL;
