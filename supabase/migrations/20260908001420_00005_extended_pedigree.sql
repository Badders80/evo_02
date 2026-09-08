BEGIN;

ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS pedigree_data JSONB,
    ADD COLUMN IF NOT EXISTS soft_legal JSONB,
    ADD COLUMN IF NOT EXISTS marketing JSONB;

UPDATE public.inventory SET listing_platform = 'evolution' WHERE listing_platform IS DISTINCT FROM 'evolution';

UPDATE public.inventory SET
    pedigree_data = jsonb_build_object(
        'sire', 'Almanzor (FR)', 'dam', 'Night Danza (AUS)', 'dam_sire', 'Danzero (AUS)',
        'lineage_summary', $lineage$By European Champion 3YO Almanzor (sire of Group 1 winners Dynastic and Manzoice). Dam Night Danza brings proven Australian speed through Golden Slipper winner Danzero.$lineage$,
        'foaling_date', '2023-10-20', 'gender', 'Filly', 'colour', 'Bay or Brown', 'breeder', 'Mrs H G & W G Bax',
        'microchip', '985125000137408', 'life_number', 'NZ00454763',
        'stud_book_url', 'https://loveracing.nz/Breeding/454763/Lady-Ketchikan-NZ-2023.aspx'
    ),
    soft_legal = jsonb_build_object(
        'aboutHorse', $about$Lady Ketchikan (barn name Nellie) is a classic-framed 3YO filly by European Champion 3YO Almanzor out of the Danzero mare Night Danza. Foaled on 20 October 2023, she carries a deliberate balance of European classic staying scope and proven Australian sprint bloodlines. Her sire Almanzor captured three Group 1 titles across Europe before establishing himself in New Zealand with classic winners including Dynastic and Manzoice. Her dam brings the precocious speed of Golden Slipper winner Danzero. In active race preparation at Byerley Park, Nellie shows a deep heart girth, strong rein, and a fluid, ground-covering gallop that suits progressive middle-distance racing.$about$,
        'trainerBio', $trainer$Nellie is prepared by Barbara Kennedy from her boutique stable at the Byerley Park training complex in Karaka. Barbara operates an individualized training model focused on progressive conditioning, patience, and matching each thoroughbred’s developmental maturity to the right black-type pathway.$trainer$,
        'racingOutlookAndPedigree', $racing$By European Champion 3YO Almanzor, sire of Group 1 Derby winners across New Zealand and Australia, out of Night Danza by Golden Slipper champion Danzero. Nellie’s physical build and pedigree profile point to an initial racing campaign over sprint-miler journeys before stretching out over classic 3YO autumn distances (1600m to 2000m). Her developmental target is a spring preparation leading into the autumn 3YO fillies' series.$racing$
    ),
    marketing = jsonb_build_object(
        'marketplaceHook', $hook$Classic 3YO filly by European Champion sire Almanzor, in active race preparation at Byerley Park.$hook$,
        'highlightTags', jsonb_build_array('By Almanzor (FR)', 'Classic Frame & Scope', 'Byerley Park Trained', 'Autumn 3YO Progression'),
        'highlights', jsonb_build_array(
            'Classic Sire Line: By European Champion 3YO Almanzor, sire of Group 1 Derby winners Dynastic & Manzoice.',
            'Australian Speed Injection: Dam Night Danza is by Golden Slipper champion Danzero, balancing staying power with sharp juvenile speed.',
            'Physical Frame: True classic staying build with deep girth and fluid stride, suited to 1600m–2000m progression.',
            'Boutique Conditioning: Conditioned by Barbara Kennedy at Byerley Park with an emphasis on tailored, individualized progression.',
            $hl$Target Pathway: Progressive spring foundation targeting the premier Autumn 3YO fillies' classic series.$hl$
        )
    ),
    pds_hash = encode(digest('pds-nellie-v1', 'sha256'), 'hex'),
    sa_hash = encode(digest('sa-nellie-v1', 'sha256'), 'hex')
WHERE slug = 'nellie';

UPDATE public.inventory SET
    pedigree_data = jsonb_build_object(
        'sire', 'Turn Me Loose (NZ)', 'dam', 'Yearn (NZ)', 'dam_sire', 'Savabeel (AUS)',
        'lineage_summary', $lineage$Sire Turn Me Loose won the VRC Emirates Stakes (Gr.1) and MRC Futurity (Gr.1). Dam Yearn (by Champion Sire Savabeel) won the Group 2 Auckland Breeders Stakes and placed in the Group 1 Thorndon Mile.$lineage$,
        'foaling_date', '2023-08-17', 'gender', 'Filly', 'colour', 'Bay', 'breeder', 'C W Kwok',
        'microchip', '985125000128426', 'life_number', 'NZ00460867',
        'stud_book_url', 'https://loveracing.nz/Breeding/460867/Yearn-NZ-2013-2023.aspx'
    ),
    soft_legal = jsonb_build_object(
        'aboutHorse', $about$Turn Me Loose x Yearn 2023 (barn name Mulan) is a bay 2YO filly by triple Group 1-winning miler Turn Me Loose out of Group 2 Auckland Thoroughbred Breeders' Stakes winner Yearn, by Champion Sire Savabeel. Foaled on 17 August 2023, she represents a deliberate cross of proven Australian miler speed with the durable, black-type form of a New Zealand staying mare. Her immediate family combines precocity with resilience: Turn Me Loose won Group 1 races between 1400 metres and 1600 metres, while Yearn was a stakes-performed miler who banked $339,895 in prizemoney. In early education at Copper Belt Lodge, Mulan has shown the alertness and the balanced action that fit the typical early-2YO campaign of her pedigree, without asking for more than she is ready to give.$about$,
        'trainerBio', $trainer$Mulan is prepared by Stephen Gray Racing from Copper Belt Lodge in Palmerston North. A Group 1-winning international trainer, Stephen returned to New Zealand after a long Singapore career and now trains from the family yard alongside his father, Kevin Gray.$trainer$,
        'racingOutlookAndPedigree', $racing$By Turn Me Loose, a three-time Group 1 winner in New Zealand and Australia (2014 NZ 2000 Guineas, 2015 VRC Emirates Stakes, 2016 MRC Futurity Stakes), out of Yearn, a Group 2 Auckland Thoroughbred Breeders' Stakes winner by Champion Sire Savabeel. Mulan's pedigree profile fits an early 2YO speed campaign through the late spring and summer, with the scope to stretch to mile-graded company as a 3YO filly. The target pathway is a 2YO introduction over sprint–miler distances, then progression into the autumn 3YO fillies' events.$racing$
    ),
    marketing = jsonb_build_object(
        'marketplaceHook', $hook$Precocious 2YO filly by triple Gr.1 winner Turn Me Loose out of Gr.2 winner Yearn ($339k).$hook$,
        'highlightTags', jsonb_build_array('Out of Gr.2 Winner Yearn ($339k)', 'Triple Gr.1 Sire Line', 'Precocious 2YO Target', 'Stephen Gray Racing'),
        'highlights', jsonb_build_array(
            'Black-Type Dam: Out of Gr.2 Auckland Breeders Stakes winner Yearn (by Champion Sire Savabeel), banking $339,895 in prizemoney.',
            'Proven Miler Sire: By triple Group 1 winner Turn Me Loose, dominant from 1400m to 1600m across Melbourne and New Zealand.',
            'Natural Precocity: Alert, compact, and balanced in early education, suited to early-season juvenile racing.',
            'Prepared by Stephen Gray Racing at Copper Belt Lodge, Palmerston North, alongside veteran horseman Kevin Gray.',
            $hl$Target Pathway: Late-spring and summer juvenile sprint-mile introduction before stepping up into 3YO fillies' black-type races.$hl$
        )
    ),
    pds_hash = encode(digest('pds-tml-x-yearn-v1', 'sha256'), 'hex'),
    sa_hash = encode(digest('sa-tml-x-yearn-v1', 'sha256'), 'hex'),
    status = 'coming_soon'
WHERE slug = 'tml-x-yearn';

UPDATE public.inventory SET
    pedigree_data = jsonb_build_object(
        'sire', 'Proisir (AUS)', 'dam', 'Little Bit Irish (NZ)', 'dam_sire', $ds$O'Reilly (NZ)$ds$,
        'lineage_summary', $lineage$By Champion Sire Proisir (sire of Prowess, Legarto, Levante). Maternal line provides proven Australasian speed and durability.$lineage$,
        'foaling_date', '2021-11-13', 'gender', 'Mare', 'colour', 'Bay', 'breeder', 'Goldeye Trust',
        'microchip', '985125000126462', 'life_number', 'NZ00441209',
        'stud_book_url', 'https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx'
    ),
    soft_legal = jsonb_build_object(
        'aboutHorse', $about$Prudentia (NZ) is a New Zealand-bred four-year-old mare who has already recorded a maiden victory and has competed across a range of distances and track conditions. Her win came over 1400 metres at Tauranga, where she handled testing Heavy conditions to score decisively. Since breaking her maiden, she has stepped into Rating 65 Benchmark company, continuing her preparation against stronger opposition.$about$,
        'trainerBio', $trainer$Prudentia is trained by Wexford Stables. Wexford Stables is a name synonymous with excellence in New Zealand racing history, continuing its legacy under the leadership of Lance O'Sullivan ONZM and Andrew Scott in Matamata.$trainer$,
        'racingOutlookAndPedigree', $racing$Prudentia carries a pedigree built for performance in Australasian racing conditions, combining a proven commercial sire with a durable New Zealand maternal line. Her sire, Proisir, is one of New Zealand's leading sires, consistently producing elite performers. Returning to training in early January 2026, she offers a high-quality ownership experience with a clear timeframe and strong upside.$racing$
    ),
    marketing = jsonb_build_object(
        'marketplaceHook', $hook$Race-winning daughter of champion sire Proisir with proven Rating 65 Benchmark form.$hook$,
        'highlightTags', jsonb_build_array('1400m Tauranga Winner', 'Heavy Track Proven', 'Rating 65 Progressor', 'Wexford Stables Prep')
    ),
    pds_hash = encode(digest('pds-prudentia-v1', 'sha256'), 'hex'),
    sa_hash = encode(digest('sa-prudentia-v1', 'sha256'), 'hex')
WHERE slug = 'prudentia';

UPDATE public.inventory SET
    pedigree_data = jsonb_build_object(
        'sire', 'Contributer (IRE)', 'dam', 'Whiffle (USA)', 'dam_sire', 'Mr. Greeley (USA)',
        'lineage_summary', $lineage$By Champion Sire Contributer out of American winning mare Whiffle, tracing directly to elite Family 13 speed.$lineage$,
        'foaling_date', '2023-10-24', 'gender', 'Filly', 'colour', 'Bay', 'breeder', 'Goldeye Trust',
        'microchip', '985125000139165', 'life_number', 'NZ00449182',
        'stud_book_url', 'https://loveracing.nz/Breeding/452052/Hottathanafantasy-NZ-2023.aspx'
    ),
    soft_legal = jsonb_build_object(
        'aboutHorse', $about$Hottathanafantasy (NZ) is a New Zealand-bred two-year-old bay filly by the champion sire Contributer (IRE) out of the winning dam Whiffle (USA)—producer of stakes-placed progeny—foaled on 24 October 2023. Bred by Goldeye Trust, she boasts a strong pedigree from Family 13, with relatives including precocious winners like Bocce and Kona Breeze.$about$,
        'trainerBio', $trainer$Hottathanafantasy is trained by Wexford Stables. Wexford Stables maintains one of the best strike rates in the country, ensuring horses like this promising filly receive top preparation for upcoming trials and races.$trainer$,
        'racingOutlookAndPedigree', $racing$Hottathanafantasy carries a pedigree built for performance in Australasian racing conditions, combining a proven commercial sire with a durable New Zealand maternal line. Her sire, Contributer, is one of New Zealand's leading sires. Returning to training in early January 2026, she offers a high-quality ownership experience.$racing$
    ),
    marketing = jsonb_build_object(
        'marketplaceHook', $hook$Promising 2YO filly by champion sire Contributer out of winning dam Whiffle.$hook$,
        'highlightTags', jsonb_build_array('By Champion Sire Contributer', 'Family 13 Speed Line', 'Wexford Stables Prep', 'Resuming Jan 2026')
    ),
    pds_hash = encode(digest('pds-hottathanafantasy-v1', 'sha256'), 'hex'),
    sa_hash = encode(digest('sa-hottathanafantasy-v1', 'sha256'), 'hex')
WHERE slug = 'hottathanafantasy';

UPDATE public.inventory SET
    pedigree_data = jsonb_build_object(
        'sire', 'Satono Aladdin (JPN)', 'dam', 'Canuhandleajandal (NZ)', 'dam_sire', 'Jimmy Choux (NZ)',
        'lineage_summary', $lineage$By Satono Aladdin (sire of Gr.1 winners Pennyweka and Tokyo Tycoon). Dam by Champion 3YO Jimmy Choux.$lineage$,
        'foaling_date', '2023-08-30', 'gender', 'Filly', 'colour', 'Bay', 'breeder', 'Goldeye Trust',
        'microchip', '985125000139219', 'life_number', 'NZ00451442',
        'stud_book_url', 'https://loveracing.nz/Breeding/451442/I-Stole-A-Manolo-NZ-2023.aspx'
    ),
    soft_legal = jsonb_build_object(
        'aboutHorse', $about$I Stole A Manolo (NZ) is a dynamic 2YO bay filly by sensational Group 1 sire Satono Aladdin out of the Jimmy Choux mare Canuhandleajandal. In early education at Wexford Stables, she blends elite turn-of-foot with classic New Zealand stamina.$about$,
        'trainerBio', $trainer$Prepared by 12-time Champion Lance O'Sullivan ONZM and Andrew Scott at Wexford Stables in Matamata.$trainer$,
        'racingOutlookAndPedigree', $racing$By Satono Aladdin (sire of Gr.1 winners Pennyweka and Tokyo Tycoon). Dam by Champion 3YO Jimmy Choux.$racing$
    ),
    marketing = jsonb_build_object(
        'marketplaceHook', $hook$Deep speed pedigree by Group 1 sire Satono Aladdin, conditioned at Wexford Stables.$hook$,
        'highlightTags', jsonb_build_array('By Gr.1 Sire Satono Aladdin', 'Dam by Jimmy Choux', 'Wexford Stables', 'Spring 3YO Progression')
    ),
    pds_hash = encode(digest('pds-i-stole-a-manolo-v1', 'sha256'), 'hex'),
    sa_hash = encode(digest('sa-i-stole-a-manolo-v1', 'sha256'), 'hex')
WHERE slug = 'i-stole-a-manolo';

UPDATE public.inventory SET
    pedigree_data = jsonb_build_object(
        'sire', 'Derryn (AUS)', 'dam', $dam$A'Guin Ace (NZ)$dam$, 'dam_sire', $ds$O'Reilly (NZ)$ds$,
        'lineage_summary', $lineage$By Derryn (AUS) out of A'Guin Ace (NZ), by O'Reilly.$lineage$,
        'foaling_date', '2021-10-02', 'gender', 'Gelding', 'colour', 'Bay', 'breeder', 'M & W Rose',
        'microchip', '985125000126713', 'life_number', 'NZ00428364',
        'stud_book_url', 'https://loveracing.nz/Breeding/428364/First-Gear-NZ-2021.aspx'
    ),
    soft_legal = jsonb_build_object(
        'aboutHorse', $about$First Gear (NZ) is a bay gelding by Derryn out of A'Guin Ace, prepared through his racing campaign by Stephen Gray Racing at Copper Belt Lodge in Palmerston North. He is a completed Evolution Stables syndicate campaign, retained on the storefront as a public track record of what the stable delivers.$about$,
        'trainerBio', $trainer$First Gear was prepared by Stephen Gray Racing from Copper Belt Lodge in Palmerston North. Stephen Gray Racing is a Group 1-winning international yard.$trainer$,
        'racingOutlookAndPedigree', $racing$By Derryn (AUS) out of A'Guin Ace (NZ), by O'Reilly. First Gear's campaign is complete. This listing is historical proof of syndicate delivery, not an open subscription.$racing$
    ),
    marketing = jsonb_build_object(
        'marketplaceHook', $hook$Completed campaign. Derryn gelding prepared by Stephen Gray Racing at Copper Belt Lodge, Palmerston North.$hook$,
        'highlightTags', jsonb_build_array('By Derryn (AUS)', 'Stephen Gray Racing', 'Copper Belt Lodge', 'Completed Campaign'),
        'highlights', jsonb_build_array(
            'Completed Campaign: Public track record of an Evolution Stables digitally-syndicated lease.',
            'Stephen Gray Racing: Prepared at Copper Belt Lodge, Palmerston North.',
            $hl$Pedigree: Derryn (AUS) out of A'Guin Ace (NZ), by O'Reilly.$hl$,
            'Listed Pool: 10 percent historical syndicate. Checkout is closed.',
            'Yard: Copper Belt Lodge is the address. The entity is Stephen Gray Racing.'
        )
    ),
    pds_hash = encode(digest('pds-first-gear-v1', 'sha256'), 'hex'),
    sa_hash = encode(digest('sa-first-gear-v1', 'sha256'), 'hex')
WHERE slug = 'first-gear';

COMMIT;;
