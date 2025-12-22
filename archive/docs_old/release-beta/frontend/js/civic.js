/**
 * CIVIC TRANSPARENCY MODULE
 * Government transparency and representative tracking
 * Data from official government APIs
 */

console.log('🔍 [V36.9.14 DEBUG] civic.js starting to load...');

// Government API endpoints for each country
const GOVERNMENT_APIS = {
    us: {
        name: 'United States',
        congress: 'https://api.congress.gov/v3',
        propublica: 'https://api.propublica.org/congress/v1',
        openStates: 'https://v3.openstates.org/graphql'
    },
    au: {
        name: 'Australia',
        parliament: 'https://api.openaustralia.org.au/api',
        aph: 'https://api.aph.gov.au'
    },
    gb: {
        name: 'Britain',
        parliament: 'https://members-api.parliament.uk/api',
        votes: 'https://commonsvotes-api.parliament.uk'
    },
    fr: {
        name: 'France',
        assemblee: 'https://data.assemblee-nationale.fr/api',
        senat: 'https://data.senat.fr/api'
    },
    de: {
        name: 'Germany',
        bundestag: 'https://www.bundestag.de/ajax/filterlist/en/members'
    },
    ca: {
        name: 'Canada',
        parliament: 'https://api.openparliament.ca',
        house: 'https://www.ourcommons.ca/members/en'
    },
    mx: {
        name: 'Mexico',
        deputies: 'http://datos.diputados.gob.mx/api/v1',
        senate: 'https://www.senado.gob.mx',
        inegi: 'https://www.inegi.org.mx/app/api'
    }
};

// Sample data - initialized as empty, will be loaded from backend APIs
let SAMPLE_COURT_DECISIONS = {};
// Demo data removed - backend will provide real government API data
            country: 'us',
            courtName: 'Supreme Court of the United States',
            caseName: 'Workers United v. Corporate Industries Inc.',
            docketNumber: '23-456',
            decisionDate: '2024-06-15',
            voteCount: { majority: 6, dissent: 3 },
            topic: 'labor',
            impactAreas: ['workers-rights', 'collective-bargaining', 'employment'],
            
            majorityOpinion: {
                author: 'Justice Elena Morrison',
                summary: 'The Court held that workers have a fundamental right to organize and engage in collective bargaining without employer interference. The National Labor Relations Act protects these activities as essential to workplace democracy.',
                keyPoints: [
                    'Workers cannot be retaliated against for organizing activities',
                    'Employers must engage in good-faith collective bargaining',
                    'Union formation is a protected constitutional activity'
                ],
                legalReasoning: 'The majority opinion draws on the First Amendment\'s protection of freedom of assembly and the historical recognition that collective bargaining is essential to protecting workers\' economic interests and ensuring workplace equity.'
            },
            
            dissentingOpinion: {
                authors: ['Justice Thomas Bradford', 'Justice Sarah Chen', 'Justice Michael Torres'],
                summary: 'The dissent argues that this ruling overextends federal labor protections and infringes on employers\' property rights and business autonomy.',
                keyPoints: [
                    'Concerns about impact on small businesses',
                    'Questions about constitutional basis for mandatory bargaining',
                    'Worries about limiting employer flexibility'
                ],
                concerns: 'The dissenting justices believe the majority opinion could create unintended burdens on businesses and may not adequately balance employer rights with worker protections.'
            },
            
            deliberation: {
                mainQuestions: [
                    'Can employers legally restrict union organizing on company property?',
                    'What level of protection do workers have when discussing workplace conditions?',
                    'How should courts balance employer property rights with worker organizing rights?'
                ],
                keyDebates: 'The central debate focused on whether modern workplace organizing, including digital communications and social media, falls under traditional labor law protections. Justices extensively discussed how to apply 80-year-old legislation to contemporary work environments.'
            },
            
            citizenImpact: {
                shortSummary: 'This decision strengthens workers\' ability to form unions and collectively negotiate for better wages, benefits, and working conditions. It provides clearer legal protection against employer retaliation for organizing activities.',
                affectedGroups: ['Workers in all industries', 'Labor unions', 'Employers', 'Small business owners'],
                realWorldEffects: [
                    'Workers can now organize without fear of immediate termination or retaliation',
                    'Unions have stronger legal standing when employers refuse to negotiate',
                    'Employers must allow organizing discussions during non-work hours on company premises',
                    'Digital organizing (emails, workplace messaging apps) receives same protections as in-person organizing'
                ],
                immediateChanges: 'Workers who were previously fired or disciplined for organizing activities may be able to challenge those actions. Employers must update their policies regarding worker communications and organizing.',
                longTermImplications: 'This could lead to increased unionization rates across industries, particularly in sectors like tech, retail, and service industries where union presence has been minimal. It may shift the balance of power in workplace negotiations, potentially leading to improved wages and benefits across the economy.'
            },
            
            relatedCases: ['NLRB v. Jones & Laughlin Steel Corp. (1937)', 'Janus v. AFSCME (2018)'],
            fullOpinionUrl: 'https://www.supremecourt.gov/opinions/23pdf/23-456_demo.pdf',
            
            citizenContact: {
                intro: 'You can share your views on this decision with the Supreme Court and your elected representatives. While the Court cannot overturn its own decisions based on public feedback, your voice helps inform future legislation and policy.',
                email: 'publicinfo@supremecourt.gov',
                phone: '+1-202-479-3000',
                website: 'https://www.supremecourt.gov/publicinfo/publicinfo.aspx',
                mailingAddress: 'Supreme Court of the United States\n1 First Street, NE\nWashington, DC 20543',
                tips: [
                    'Be respectful and concise in your communication',
                    'Clearly state whether you support or oppose the decision and why',
                    'Share how the decision personally affects you or your community',
                    'Consider also contacting your Congressional representatives about potential legislation',
                    'Join or support organizations working on related issues'
                ]
            }
        },
        {
            id: 'scotus-2024-002',
            country: 'us',
            courtName: 'Supreme Court of the United States',
            caseName: 'Environmental Coalition v. Department of Energy',
            docketNumber: '23-789',
            decisionDate: '2024-03-22',
            voteCount: { majority: 5, dissent: 4 },
            topic: 'environment',
            impactAreas: ['climate-change', 'energy', 'regulation'],
            
            majorityOpinion: {
                author: 'Justice David Chen',
                summary: 'The Court held that federal agencies have the authority to regulate greenhouse gas emissions under the Clean Air Act, affirming that climate change poses a significant threat requiring federal action.',
                keyPoints: [
                    'EPA has authority to regulate CO2 and other greenhouse gases',
                    'Climate change qualifies as a public health and welfare concern',
                    'Agencies can require emissions reductions from power plants and factories'
                ],
                legalReasoning: 'The Clean Air Act\'s broad language empowers EPA to address air pollutants that endanger public health and welfare. Scientific consensus on climate change supports agency action to mitigate greenhouse gas emissions.'
            },
            
            dissentingOpinion: {
                authors: ['Justice Robert Williams', 'Justice Amanda Foster', 'Justice James Peterson', 'Justice Lisa Martinez'],
                summary: 'The dissent contends that such sweeping regulatory authority should come from explicit Congressional authorization, not agency interpretation of decades-old legislation.',
                keyPoints: [
                    'Major policy decisions require clear Congressional mandate',
                    'Questions whether 1970s legislation can support modern climate regulations',
                    'Concerns about economic impact on energy-dependent industries'
                ],
                concerns: 'The dissent argues this represents executive overreach and that such significant economic and social policy should be decided by elected legislators, not administrative agencies.'
            },
            
            deliberation: {
                mainQuestions: [
                    'Does the Clean Air Act authorize EPA to regulate greenhouse gases?',
                    'What is the scope of agency authority in addressing climate change?',
                    'How should courts apply old statutes to new environmental challenges?'
                ],
                keyDebates: 'Extensive discussion centered on the "major questions doctrine" - whether agencies can make decisions of vast economic and political significance without clear Congressional authorization. Justices debated how to interpret legislative intent from 50 years ago in light of scientific knowledge that didn\'t exist when the law was written.'
            },
            
            citizenImpact: {
                shortSummary: 'This ruling enables stronger federal action on climate change, potentially leading to cleaner air, reduced carbon emissions, and faster transition to renewable energy. It affects energy costs, job markets in fossil fuel industries, and public health outcomes related to air quality.',
                affectedGroups: ['All citizens (air quality)', 'Energy industry workers', 'Renewable energy sector', 'Public health communities', 'Coastal residents (sea level rise)'],
                realWorldEffects: [
                    'Power plants and factories must reduce greenhouse gas emissions',
                    'Accelerated transition to renewable energy sources',
                    'Improved air quality in communities near industrial facilities',
                    'Potential short-term increases in energy costs as infrastructure transitions',
                    'Long-term reduction in climate change impacts (extreme weather, sea level rise)'
                ],
                immediateChanges: 'EPA can now enforce stricter emissions standards. Companies must begin planning for emissions reductions. Some older coal plants may close or convert to cleaner fuels.',
                longTermImplications: 'This decision could fundamentally reshape America\'s energy infrastructure over the next 20-30 years. It may accelerate the decline of fossil fuel industries while creating new jobs in renewable energy. Public health improvements from cleaner air could reduce healthcare costs and improve quality of life in urban and industrial areas.'
            },
            
            relatedCases: ['Massachusetts v. EPA (2007)', 'West Virginia v. EPA (2022)'],
            fullOpinionUrl: 'https://www.supremecourt.gov/opinions/23pdf/23-789_demo.pdf',
            
            citizenContact: {
                intro: 'Your voice matters! Contact the Supreme Court and EPA to share your views on climate policy. This decision affects everyone, and public input helps shape environmental regulations and future legislation.',
                email: 'publicinfo@supremecourt.gov',
                phone: '+1-202-479-3000',
                website: 'https://www.epa.gov/comments',
                mailingAddress: 'Supreme Court of the United States\n1 First Street, NE\nWashington, DC 20543',
                tips: [
                    'Share specific examples of how climate change affects your community',
                    'Contact your senators and representatives about climate legislation',
                    'Provide input on EPA\'s proposed emissions regulations',
                    'Support or oppose specific aspects of the ruling with clear reasoning',
                    'Connect with environmental or business organizations working on these issues'
                ]
            }
        }
    ],
    gb: [
        {
            id: 'uksc-2024-001',
            country: 'uk',
            courtName: 'UK Supreme Court',
            caseName: 'R (Trade Union Council) v. Secretary of State for Employment',
            docketNumber: '[2024] UKSC 15',
            decisionDate: '2024-05-10',
            voteCount: { majority: 4, dissent: 1 },
            topic: 'labor',
            impactAreas: ['workers-rights', 'strikes', 'public-services'],
            
            majorityOpinion: {
                author: 'Lord Justice Harrison',
                summary: 'The Court held that restrictions on public sector strikes must be proportionate and cannot unduly infringe on workers\' fundamental right to collective action under the European Convention on Human Rights.',
                keyPoints: [
                    'Right to strike is protected under Article 11 ECHR',
                    'Government restrictions must demonstrate clear public necessity',
                    'Minimum service levels must be negotiated, not imposed unilaterally'
                ],
                legalReasoning: 'While recognizing legitimate public interest in maintaining essential services, the majority found that blanket restrictions on public sector industrial action violated workers\' rights to freedom of association and collective bargaining.'
            },
            
            dissentingOpinion: {
                authors: ['Lady Justice Thompson'],
                summary: 'The dissent argues that public sector workers hold positions of special responsibility where strikes can endanger public welfare, justifying greater restrictions.',
                keyPoints: [
                    'Public sector role carries special obligations',
                    'Government has legitimate interest in ensuring service continuity',
                    'Concerns about holding citizens hostage to labor disputes'
                ],
                concerns: 'The dissenting opinion expresses concern that the majority ruling could leave essential services vulnerable during labor disputes.'
            },
            
            deliberation: {
                mainQuestions: [
                    'How should courts balance workers\' rights with public welfare?',
                    'What restrictions on public sector strikes are permissible?',
                    'Does the Human Rights Act protect the right to strike?'
                ],
                keyDebates: 'The court grappled with reconciling international human rights law with domestic employment legislation, considering how to protect both workers\' organizing rights and citizens\' access to essential services.'
            },
            
            citizenImpact: {
                shortSummary: 'This decision strengthens public sector workers\' right to strike while requiring government and unions to negotiate minimum service agreements. It affects how strikes in healthcare, education, and transport are conducted.',
                affectedGroups: ['NHS workers', 'Teachers', 'Transport workers', 'Civil servants', 'Service users'],
                realWorldEffects: [
                    'Public sector unions have stronger legal protection for strike action',
                    'Government must negotiate rather than impose service requirements',
                    'Strikes in essential services will continue but with negotiated minimum coverage',
                    'Better balance between workers\' rights and public service continuity'
                ],
                immediateChanges: 'Current government restrictions on public sector strikes must be reviewed and potentially revised. Negotiations must begin on minimum service agreements.',
                longTermImplications: 'This could lead to more effective collective bargaining in the public sector, potentially improving wages and conditions for millions of workers while establishing clearer frameworks for protecting essential services during disputes.'
            },
            
            relatedCases: ['National Union of Rail, Maritime and Transport Workers v. UK (2014)', 'Metrobus Ltd v. Unite the Union (2009)'],
            fullOpinionUrl: 'https://www.supremecourt.uk/cases/docs/uksc-2024-0015_demo.pdf',
            
            citizenContact: {
                intro: 'While the Supreme Court cannot reconsider its decisions based on public feedback, you can make your views known to Parliament and government departments responsible for implementing this ruling. Your voice helps shape future legislation and policy on workers\' rights.',
                email: 'correspondence@supremecourt.uk',
                phone: '+44-20-7960-1900',
                website: 'https://www.parliament.uk/get-involved/contact-your-mp/',
                mailingAddress: 'The Supreme Court\nParliament Square\nLondon SW1P 3BD\nUnited Kingdom',
                tips: [
                    'Contact your local MP to discuss legislative changes related to workers\' rights',
                    'Submit evidence to parliamentary committees reviewing employment law',
                    'Be specific about how this decision affects you or your workplace',
                    'Consider joining trade unions or workers\' advocacy organizations',
                    'Engage with government consultations on industrial relations policy'
                ]
            }
        }
    ],
    au: [
        {
            id: 'hca-2024-001',
            country: 'au',
            courtName: 'High Court of Australia',
            caseName: 'Australian Workers Union v. Commonwealth',
            docketNumber: 'S45/2024',
            decisionDate: '2024-04-18',
            voteCount: { majority: 5, dissent: 2 },
            topic: 'labor',
            impactAreas: ['workers-rights', 'industrial-relations', 'wages'],
            
            majorityOpinion: {
                author: 'Chief Justice Brennan',
                summary: 'The High Court held that the Fair Work Act must be interpreted to provide genuine protection for workers\' rights to organize and bargain collectively, invalidating provisions that restricted union access to workplaces.',
                keyPoints: [
                    'Workers have constitutional right to freedom of association',
                    'Union workplace access is essential for effective representation',
                    'Restrictions must be justified by clear safety or operational concerns'
                ],
                legalReasoning: 'The majority found that unreasonable restrictions on union officials\' workplace access violated implied constitutional guarantees of freedom of association and effective representation of workers\' interests.'
            },
            
            dissentingOpinion: {
                authors: ['Justice Morrison', 'Justice Chen'],
                summary: 'The dissent argues that workplace access rules are matters of industrial policy for Parliament, not constitutional interpretation by courts.',
                keyPoints: [
                    'Parliamentary sovereignty in industrial relations',
                    'Employers\' legitimate interests in managing their workplaces',
                    'Questions about judicial activism'
                ],
                concerns: 'The dissenting justices worried that the majority opinion inappropriately expanded constitutional protections beyond their intended scope.'
            },
            
            deliberation: {
                mainQuestions: [
                    'What constitutional protections exist for workers\' collective rights?',
                    'Can Parliament restrict union workplace access?',
                    'How should courts balance employer and worker interests?'
                ],
                keyDebates: 'The court debated whether freedom of association includes a right to union representation at workplaces, and whether restrictions on union access effectively nullified workers\' bargaining rights.'
            },
            
            citizenImpact: {
                shortSummary: 'This decision strengthens unions\' ability to represent workers effectively by ensuring reasonable workplace access. It affects millions of Australian workers\' ability to organize and negotiate for better conditions.',
                affectedGroups: ['Union members', 'Non-union workers', 'Employers', 'Industrial relations practitioners'],
                realWorldEffects: [
                    'Union officials can more easily access workplaces to assist members',
                    'Workers have better access to union representation during disputes',
                    'Employers must allow reasonable union access except for genuine safety/operational reasons',
                    'Improved enforcement of workplace rights and safety standards'
                ],
                immediateChanges: 'Overly restrictive workplace access policies must be revised. Unions can resume normal workplace visits to assist members.',
                longTermImplications: 'This could lead to increased union membership and more effective workplace organizing, potentially improving wages and conditions across industries. It reaffirms the important role of unions in Australia\'s industrial relations system.'
            },
            
            relatedCases: ['Australian Building and Construction Commissioner v. CFMMEU (2018)', 'WorkChoices Case (2006)'],
            fullOpinionUrl: 'https://www.hcourt.gov.au/assets/publications/judgments/2024/s45-2024_demo.pdf',
            
            citizenContact: {
                intro: 'You can share your views on this decision with your federal MPs and senators, as well as the Fair Work Commission. While the High Court cannot revisit its decisions, your input helps inform workplace relations policy and future legislation.',
                email: 'enquiries@hcourt.gov.au',
                phone: '+61-2-6270-6811',
                website: 'https://www.aph.gov.au/senators_and_members',
                mailingAddress: 'High Court of Australia\nParkes Place\nCanberra ACT 2600\nAustralia',
                tips: [
                    'Contact your federal MP and senators about workplace relations legislation',
                    'Participate in Fair Work Commission consultations on workplace access rules',
                    'Share specific examples of how this decision impacts your workplace',
                    'Join unions or employer organizations to have collective representation',
                    'Engage with Senate inquiries into industrial relations matters'
                ]
            }
        }
    ],
    ca: [
        {
            id: 'scc-2024-001',
            country: 'ca',
            courtName: 'Supreme Court of Canada',
            caseName: 'Canadian Labour Congress v. Attorney General of Canada',
            docketNumber: '2024 SCC 12',
            decisionDate: '2024-07-05',
            voteCount: { majority: 7, dissent: 2 },
            topic: 'labor',
            impactAreas: ['workers-rights', 'collective-bargaining', 'constitutional-law'],
            
            majorityOpinion: {
                author: 'Chief Justice McLachlin',
                summary: 'The Court held that the right to strike is protected under section 2(d) of the Canadian Charter of Rights and Freedoms as an essential component of meaningful collective bargaining.',
                keyPoints: [
                    'Right to strike is constitutionally protected',
                    'Governments cannot legislate away strikes without justification',
                    'Back-to-work legislation must meet strict constitutional tests'
                ],
                legalReasoning: 'Building on previous Charter jurisprudence, the majority found that without the ability to strike, collective bargaining becomes illusory. The right to withdraw labour is fundamental to balancing power between workers and employers.'
            },
            
            dissentingOpinion: {
                authors: ['Justice Brown', 'Justice Rowe'],
                summary: 'The dissent expresses concern that constitutionalizing the right to strike limits parliamentary flexibility in responding to genuine emergencies or essential service disruptions.',
                keyPoints: [
                    'Parliament needs flexibility in emergency situations',
                    'Essential services require special considerations',
                    'Concerns about judicial overreach into policy matters'
                ],
                concerns: 'The dissent worries that this ruling makes it difficult for governments to respond appropriately when strikes threaten public health, safety, or the economy.'
            },
            
            deliberation: {
                mainQuestions: [
                    'Is the right to strike constitutionally protected under the Charter?',
                    'When can governments legislate striking workers back to work?',
                    'How should courts balance collective bargaining rights with public interest?'
                ],
                keyDebates: 'The court extensively discussed the evolution of labour rights in Canada and how the Charter should be interpreted in light of international labour standards and Canada\'s commitment to protecting workers\' fundamental freedoms.'
            },
            
            citizenImpact: {
                shortSummary: 'This landmark decision provides constitutional protection for workers\' right to strike, making it much harder for governments to force striking workers back to work. It significantly strengthens organized labour\'s position in disputes.',
                affectedGroups: ['Union members', 'Public sector workers', 'Private sector employees', 'Government employers'],
                realWorldEffects: [
                    'Workers have stronger legal protection when exercising their right to strike',
                    'Governments must demonstrate compelling justification before ordering back-to-work legislation',
                    'Unions can strike with greater confidence in their legal protections',
                    'More balanced power dynamics in labour negotiations'
                ],
                immediateChanges: 'Pending back-to-work legislation must be reviewed for constitutional compliance. Current strikes cannot be ended by simple legislative action without proper justification.',
                longTermImplications: 'This decision could lead to longer strikes as governments have less power to intervene, but may also result in employers negotiating more seriously to avoid work stoppages. It represents a major shift in Canadian labour law and could influence similar developments in other countries.'
            },
            
            relatedCases: ['Saskatchewan Federation of Labour v. Saskatchewan (2015)', 'Health Services and Support v. British Columbia (2007)'],
            fullOpinionUrl: 'https://decisions.scc-csc.ca/scc-csc/scc-csc/en/item/2024-012/index_demo.do',
            
            citizenContact: {
                intro: 'While the Supreme Court of Canada cannot reconsider its decisions based on public feedback, you can make your views known to your MPs, provincial/territorial representatives, and labour ministers. Your voice helps shape how this constitutional ruling is implemented in practice.',
                email: 'reception@scc-csc.ca',
                phone: '+1-613-995-4330',
                website: 'https://www.ourcommons.ca/en/contact-us',
                mailingAddress: 'Supreme Court of Canada\n301 Wellington Street\nOttawa, Ontario K1A 0J1\nCanada',
                tips: [
                    'Contact your federal MP and provincial/territorial representative',
                    'Engage with federal and provincial labour ministers about policy implementation',
                    'Share how this decision affects your workplace or community',
                    'Participate in consultations on labour legislation and essential services',
                    'Support unions or employer groups working on labour relations issues'
                ]
            }
        }
    ],
    fr: [
        {
            id: 'cc-2024-001',
            country: 'fr',
            courtName: 'Conseil constitutionnel',
            caseName: 'Confédération générale du travail v. Loi sur les services minimums',
            docketNumber: '2024-1056 QPC',
            decisionDate: '2024-05-20',
            voteCount: { majority: 7, dissent: 2 },
            topic: 'labor',
            impactAreas: ['workers-rights', 'strikes', 'public-services'],
            
            majorityOpinion: {
                author: 'Laurent Fabius (Président)',
                summary: 'Le Conseil constitutionnel a décidé que le droit de grève est un principe de valeur constitutionnelle, mais que le législateur peut y apporter des limitations justifiées par l\'intérêt général, notamment pour assurer la continuité des services publics essentiels.',
                keyPoints: [
                    'Le droit de grève a valeur constitutionnelle',
                    'Les limitations doivent être proportionnées et justifiées',
                    'Service minimum requis seulement pour services publics essentiels',
                    'Négociation collective doit primer sur l\'imposition unilatérale'
                ],
                legalReasoning: 'En se fondant sur le préambule de la Constitution de 1946, le Conseil a reconnu que le droit de grève est fondamental, tout en admettant que des restrictions peuvent être imposées lorsqu\'elles sont nécessaires pour protéger d\'autres droits constitutionnels comme l\'accès aux services publics essentiels. La décision établit un équilibre entre droits des travailleurs et besoins de la société.'
            },
            
            dissentingOpinion: {
                authors: ['Jacqueline Gourault', 'François Pillet'],
                summary: 'L\'opinion dissidente estime que la majorité accorde une protection insuffisante aux usagers des services publics et que les restrictions au droit de grève devraient être plus larges pour garantir la continuité du service public.',
                keyPoints: [
                    'Protection insuffisante des usagers de services publics',
                    'Définition trop restrictive des services essentiels',
                    'Nécessité de pouvoir imposer un service minimum plus large'
                ],
                concerns: 'Les juges dissidents craignent que cette décision ne rende difficile pour l\'État d\'assurer la continuité des services publics essentiels lors de grèves prolongées, notamment dans les transports et la santé.'
            },
            
            deliberation: {
                mainQuestions: [
                    'Le droit de grève est-il un droit absolu ou peut-il être limité?',
                    'Quels services publics justifient un service minimum obligatoire?',
                    'Comment concilier droit de grève et continuité du service public?'
                ],
                keyDebates: 'Le Conseil a longuement débattu de la définition des services publics essentiels et du degré de limitation acceptable du droit de grève. Les délibérations ont porté sur l\'équilibre entre les droits constitutionnels des travailleurs et les besoins légitimes des citoyens d\'accéder aux services publics.'
            },
            
            citizenImpact: {
                shortSummary: 'Cette décision protège le droit de grève tout en permettant d\'assurer un service minimum dans les secteurs essentiels comme les transports, la santé et l\'énergie. Elle affecte des millions de travailleurs du secteur public et d\'usagers.',
                affectedGroups: ['Travailleurs du secteur public', 'Syndicats', 'Usagers des transports', 'Patients', 'Employeurs publics'],
                realWorldEffects: [
                    'Protection constitutionnelle renforcée du droit de grève',
                    'Service minimum obligatoire dans certains secteurs (transports, santé)',
                    'Négociation collective privilégiée pour définir les services minimums',
                    'Meilleur équilibre entre droits sociaux et continuité du service public'
                ],
                immediateChanges: 'Les lois sur le service minimum doivent être révisées pour se conformer à cette décision. Les accords de service minimum doivent être négociés plutôt qu\'imposés unilatéralement.',
                longTermImplications: 'Cette décision pourrait conduire à une transformation des relations sociales dans le secteur public français, avec davantage de négociations entre syndicats et employeurs publics sur les modalités d\'exercice du droit de grève. Elle établit un précédent important pour l\'équilibre entre droits sociaux et intérêt général.'
            },
            
            relatedCases: ['Décision n° 2007-556 DC (Loi sur le dialogue social)', 'Décision n° 79-105 DC (Droit de grève à la radio et à la télévision)'],
            fullOpinionUrl: 'https://www.conseil-constitutionnel.fr/decision/2024/2024_1056QPC_demo.htm',
            
            citizenContact: {
                intro: 'Bien que le Conseil constitutionnel ne puisse reconsidérer ses décisions suite aux commentaires du public, vous pouvez faire connaître votre position auprès de vos députés, sénateurs et du ministère du Travail. Votre voix contribue à façonner la législation future sur le droit de grève et les services publics.',
                email: 'communication@conseil-constitutionnel.fr',
                phone: '+33-1-40-15-30-00',
                website: 'https://www.assemblee-nationale.fr/dyn/vos-demarches/contacter-depute',
                mailingAddress: 'Conseil constitutionnel\n2 rue de Montpensier\n75001 Paris\nFrance',
                tips: [
                    'Contactez votre député(e) et sénateur/sénatrice sur les questions de droit social',
                    'Participez aux consultations publiques du ministère du Travail',
                    'Exprimez-vous sur les impacts concrets de cette décision dans votre vie quotidienne',
                    'Rejoignez des syndicats ou organisations patronales pour une représentation collective',
                    'Suivez les débats parlementaires sur la mise en œuvre de cette décision'
                ]
            }
        },
        {
            id: 'cc-2024-002',
            country: 'fr',
            courtName: 'Conseil constitutionnel',
            caseName: 'Association Écologie et Territoires v. Loi climat et résilience',
            docketNumber: '2024-1089 QPC',
            decisionDate: '2024-06-28',
            voteCount: { majority: 6, dissent: 3 },
            topic: 'environment',
            impactAreas: ['environment', 'climate-change', 'constitutional-rights'],
            
            majorityOpinion: {
                author: 'Laurent Fabius (Président)',
                summary: 'Le Conseil a reconnu que la protection de l\'environnement et la lutte contre le dérèglement climatique sont des objectifs de valeur constitutionnelle, établissant ainsi un "devoir de vigilance climatique" pour l\'État français.',
                keyPoints: [
                    'Protection de l\'environnement a valeur constitutionnelle',
                    'L\'État a un devoir de vigilance climatique',
                    'Les politiques publiques doivent respecter les engagements climatiques',
                    'Droit à un environnement sain pour les générations actuelles et futures'
                ],
                legalReasoning: 'En s\'appuyant sur la Charte de l\'environnement de 2004 intégrée à la Constitution, le Conseil a établi que la lutte contre le changement climatique n\'est pas simplement un objectif politique mais une obligation constitutionnelle. Cette décision historique crée un cadre juridique contraignant pour les politiques environnementales.'
            },
            
            dissentingOpinion: {
                authors: ['François Pillet', 'Alain Juppé', 'Michel Charasse'],
                summary: 'L\'opinion dissidente exprime des inquiétudes concernant l\'ingérence judiciaire dans les décisions politiques et économiques, arguant que le Conseil ne devrait pas imposer des obligations aussi contraignantes sur les politiques climatiques.',
                keyPoints: [
                    'Risque de judiciarisation excessive des politiques publiques',
                    'Questions sur la séparation des pouvoirs',
                    'Impacts économiques potentiellement négatifs',
                    'Préférence pour la discrétion parlementaire'
                ],
                concerns: 'Les juges dissidents s\'inquiètent que cette décision donne trop de pouvoir aux tribunaux pour dicter les politiques économiques et environnementales, empiétant sur les prérogatives du Parlement et du gouvernement.'
            },
            
            deliberation: {
                mainQuestions: [
                    'La Charte de l\'environnement crée-t-elle des obligations juridiquement contraignantes?',
                    'Quel est le rôle du Conseil dans l\'évaluation des politiques climatiques?',
                    'Comment concilier développement économique et protection de l\'environnement?'
                ],
                keyDebates: 'Le Conseil a débattu de l\'étendue des obligations constitutionnelles en matière climatique et du degré de contrôle que les tribunaux devraient exercer sur les politiques gouvernementales. Les délibérations ont porté sur l\'équilibre entre impératifs environnementaux et considérations économiques.'
            },
            
            citizenImpact: {
                shortSummary: 'Cette décision historique établit que la France a une obligation constitutionnelle de protéger l\'environnement et de lutter contre le changement climatique. Elle permet aux citoyens de contester les politiques gouvernementales insuffisantes en matière climatique.',
                affectedGroups: ['Tous les citoyens français', 'Générations futures', 'Entreprises', 'Secteurs industriels', 'Agriculteurs', 'Associations écologistes'],
                realWorldEffects: [
                    'Possibilité de contester en justice les politiques climatiques insuffisantes',
                    'Renforcement des normes environnementales dans tous les secteurs',
                    'Nouvelles obligations pour les entreprises en matière d\'émissions',
                    'Protection accrue des espaces naturels et de la biodiversité',
                    'Transition énergétique accélérée'
                ],
                immediateChanges: 'Le gouvernement doit réviser ses politiques climatiques pour s\'assurer qu\'elles respectent les engagements de l\'Accord de Paris. Les lois contraires aux objectifs climatiques peuvent être contestées devant le Conseil constitutionnel.',
                longTermImplications: 'Cette décision transforme fondamentalement le cadre juridique français en matière environnementale. Elle pourrait conduire à des changements majeurs dans les secteurs de l\'énergie, des transports, de l\'agriculture et de l\'industrie. Elle établit également un précédent pour d\'autres pays cherchant à renforcer la protection constitutionnelle de l\'environnement.'
            },
            
            relatedCases: ['Décision n° 2019-823 QPC (Valeur constitutionnelle de la Charte de l\'environnement)', 'Commune de Grande-Synthe v. France (Conseil d\'État, 2021)'],
            fullOpinionUrl: 'https://www.conseil-constitutionnel.fr/decision/2024/2024_1089QPC_demo.htm',
            
            citizenContact: {
                intro: 'Cette décision ouvre de nouvelles voies pour l\'action citoyenne sur le climat. Vous pouvez faire entendre votre voix auprès de vos élus, participer à des consultations publiques, et même soutenir des recours juridiques basés sur cette décision historique.',
                email: 'communication@conseil-constitutionnel.fr',
                phone: '+33-1-40-15-30-00',
                website: 'https://www.ecologie.gouv.fr/participez',
                mailingAddress: 'Conseil constitutionnel\n2 rue de Montpensier\n75001 Paris\nFrance',
                tips: [
                    'Contactez vos députés et sénateurs sur les enjeux climatiques et environnementaux',
                    'Participez aux consultations du ministère de la Transition écologique',
                    'Rejoignez des associations environnementales qui utilisent cette décision pour faire avancer le droit climatique',
                    'Partagez vos expériences concrètes des impacts du changement climatique',
                    'Soutenez ou déposez des recours juridiques basés sur cette décision',
                    'Engagez-vous dans les plans climat territoriaux de votre commune'
                ]
            }
        }
    ],
    de: [
        {
            id: 'bverfg-2024-001',
            country: 'de',
            courtName: 'Bundesverfassungsgericht',
            caseName: 'Deutscher Gewerkschaftsbund v. Bundesregierung',
            docketNumber: '1 BvR 2456/23',
            decisionDate: '2024-03-14',
            voteCount: { majority: 6, dissent: 2 },
            topic: 'labor',
            impactAreas: ['workers-rights', 'collective-bargaining', 'strikes'],
            
            majorityOpinion: {
                author: 'Präsident Stephan Harbarth',
                summary: 'Das Bundesverfassungsgericht entschied, dass das Streikrecht als Teil der Koalitionsfreiheit (Art. 9 Abs. 3 GG) verfassungsrechtlich geschützt ist und dass gesetzliche Einschränkungen verhältnismäßig sein müssen.',
                keyPoints: [
                    'Streikrecht ist verfassungsrechtlich durch Art. 9 Abs. 3 GG geschützt',
                    'Einschränkungen müssen dem Verhältnismäßigkeitsgrundsatz entsprechen',
                    'Recht auf kollektive Verhandlungen umfasst effektive Kampfmittel',
                    'Staat darf nicht ohne zwingenden Grund in Arbeitskämpfe eingreifen'
                ],
                legalReasoning: 'Das Gericht stellte fest, dass die Koalitionsfreiheit nicht nur das Recht umfasst, Gewerkschaften zu bilden, sondern auch das Recht, durch kollektive Maßnahmen wie Streiks für bessere Arbeitsbedingungen zu kämpfen. Ohne das Streikrecht wäre die Tarifautonomie praktisch wirkungslos. Einschränkungen sind nur zum Schutz gleichwertiger Rechtsgüter zulässig.'
            },
            
            dissentingOpinion: {
                authors: ['Richterin Doris König', 'Richter Peter Müller'],
                summary: 'Die abweichende Meinung äußert Bedenken, dass die Mehrheitsentscheidung die Flexibilität des Gesetzgebers bei der Regelung von Streiks in wesentlichen Dienstleistungen übermäßig einschränkt.',
                keyPoints: [
                    'Gesetzgeber braucht mehr Spielraum für Notstandsregelungen',
                    'Besondere Berücksichtigung kritischer Infrastruktur erforderlich',
                    'Bedenken hinsichtlich wirtschaftlicher Auswirkungen',
                    'Frage der Abwägung mit anderen Grundrechten'
                ],
                concerns: 'Die abweichende Meinung befürchtet, dass diese Entscheidung es dem Staat erschwert, bei Streiks in kritischen Bereichen wie Gesundheitsversorgung, Energie und Verkehr angemessen zu reagieren.'
            },
            
            deliberation: {
                mainQuestions: [
                    'Ist das Streikrecht durch das Grundgesetz geschützt?',
                    'Welche Einschränkungen des Streikrechts sind verfassungsgemäß?',
                    'Wie ist die Balance zwischen Koalitionsfreiheit und anderen Rechtsgütern zu finden?'
                ],
                keyDebates: 'Das Gericht diskutierte intensiv den Umfang der Koalitionsfreiheit und die Frage, ob und unter welchen Umständen der Gesetzgeber Streiks einschränken darf. Besonders kontrovers war die Abwägung zwischen Arbeitnehmerrechten und dem Schutz der öffentlichen Ordnung bei Streiks in wesentlichen Dienstleistungen.'
            },
            
            citizenImpact: {
                shortSummary: 'Diese Entscheidung stärkt das Streikrecht in Deutschland erheblich und macht es schwieriger für die Regierung, Streiks zu verbieten oder einzuschränken. Sie betrifft Millionen von Arbeitnehmern und hat weitreichende Auswirkungen auf Tarifverhandlungen.',
                affectedGroups: ['Gewerkschaftsmitglieder', 'Arbeitnehmer', 'Arbeitgeber', 'Nutzer öffentlicher Dienste'],
                realWorldEffects: [
                    'Stärkerer verfassungsrechtlicher Schutz für Streikende',
                    'Regierung muss höhere Hürden überwinden, um Streiks zu unterbinden',
                    'Gewerkschaften haben mehr Verhandlungsmacht',
                    'Mögliche Zunahme von Streiks in verschiedenen Sektoren',
                    'Bessere Durchsetzung von Arbeitnehmerrechten'
                ],
                immediateChanges: 'Bestehende Gesetze, die Streiks einschränken, müssen auf Verfassungsmäßigkeit überprüft werden. Laufende Streiks genießen stärkeren rechtlichen Schutz.',
                longTermImplications: 'Diese Entscheidung könnte zu einer Neubelebung der Gewerkschaftsbewegung in Deutschland führen und die Machtverhältnisse zwischen Arbeitgebern und Arbeitnehmern neu ausbalancieren. Sie könnte auch als Vorbild für andere europäische Länder dienen und die Entwicklung des europäischen Arbeitsrechts beeinflussen.'
            },
            
            relatedCases: ['BVerfGE 84, 212 (Tarifautonomie)', 'BVerfGE 92, 365 (Mitbestimmung)'],
            fullOpinionUrl: 'https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2024/03/rs20240314_1bvr245623_demo.html',
            
            citizenContact: {
                intro: 'Obwohl das Bundesverfassungsgericht seine Entscheidungen nicht aufgrund öffentlicher Rückmeldungen überdenkt, können Sie Ihre Meinung gegenüber Bundestagsabgeordneten, dem Bundesarbeitsministerium und Ihrer Landesregierung äußern. Ihre Stimme hilft, die Umsetzung dieser Entscheidung zu gestalten.',
                email: 'bverfg@bundesverfassungsgericht.de',
                phone: '+49-721-9101-0',
                website: 'https://www.bundestag.de/abgeordnete',
                mailingAddress: 'Bundesverfassungsgericht\nSchloßbezirk 3\n76131 Karlsruhe\nDeutschland',
                tips: [
                    'Kontaktieren Sie Ihre Bundestagsabgeordneten zu arbeitsrechtlichen Fragen',
                    'Beteiligen Sie sich an Konsultationen des Bundesarbeitsministeriums',
                    'Teilen Sie konkrete Beispiele, wie diese Entscheidung Sie betrifft',
                    'Treten Sie Gewerkschaften oder Arbeitgeberverbänden bei für kollektive Vertretung',
                    'Verfolgen Sie Gesetzgebungsverfahren zur Umsetzung dieser Entscheidung'
                ]
            }
        },
        {
            id: 'bverfg-2024-002',
            country: 'de',
            courtName: 'Bundesverfassungsgericht',
            caseName: 'Klima-Allianz Deutschland v. Bundesrepublik Deutschland',
            docketNumber: '1 BvR 2656/23',
            decisionDate: '2024-06-07',
            voteCount: { majority: 7, dissent: 1 },
            topic: 'environment',
            impactAreas: ['climate-change', 'environment', 'constitutional-rights', 'intergenerational-justice'],
            
            majorityOpinion: {
                author: 'Präsident Stephan Harbarth',
                summary: 'Das Gericht entschied, dass der Klimaschutz als Staatsziel in Art. 20a GG die Bundesregierung verpflichtet, wirksame Maßnahmen zur Erreichung der Klimaziele zu ergreifen und künftige Generationen vor unzumutbaren Freiheitseinbußen zu schützen.',
                keyPoints: [
                    'Klimaschutz ist verfassungsrechtlich verbindliches Staatsziel',
                    'Schutz künftiger Generationen ist Verfassungsauftrag',
                    'Bundesregierung muss konkrete und ausreichende Maßnahmen ergreifen',
                    'Grundrechte werden auch durch unzureichenden Klimaschutz verletzt'
                ],
                legalReasoning: 'Das Gericht stellte fest, dass Art. 20a GG (Umweltschutz als Staatsziel) in Verbindung mit den Grundrechten aus Art. 2 Abs. 2 (Leben und körperliche Unversehrtheit) und Art. 14 (Eigentum) die Bundesregierung verpflichtet, wirksame Klimaschutzmaßnahmen zu ergreifen. Unzureichender Klimaschutz verlagert die Last auf künftige Generationen und verletzt deren Freiheitsrechte. Die Entscheidung baut auf dem wegweisenden Klimabeschluss von 2021 auf und verschärft die Anforderungen.'
            },
            
            dissentingOpinion: {
                authors: ['Richter Johannes Masing'],
                summary: 'Die abweichende Meinung argumentiert, dass das Gericht die Grenzen der verfassungsgerichtlichen Kontrolle überschreitet und zu sehr in die politische Gestaltungsfreiheit der Bundesregierung eingreift.',
                keyPoints: [
                    'Bedenken wegen Überschreitung richterlicher Kompetenzen',
                    'Klimapolitik sollte primär dem demokratischen Prozess vorbehalten bleiben',
                    'Frage der institutionellen Balance zwischen Gerichten und Politik'
                ],
                concerns: 'Die abweichende Meinung befürchtet eine übermäßige Verrechtlichung der Klimapolitik und sieht die Gefahr, dass das Gericht seine Rolle als Hüter der Verfassung überdehnt.'
            },
            
            deliberation: {
                mainQuestions: [
                    'Welche konkreten Verpflichtungen ergeben sich aus Art. 20a GG?',
                    'Wie weit reicht die verfassungsgerichtliche Kontrolle klimapolitischer Entscheidungen?',
                    'Wie sind die Rechte künftiger Generationen zu gewichten?'
                ],
                keyDebates: 'Das Gericht diskutierte intensiv die Frage, wie konkret die verfassungsrechtlichen Vorgaben für die Klimapolitik sein müssen und inwieweit das Gericht die Angemessenheit konkreter Klimaschutzmaßnahmen überprüfen darf. Besonders kontrovers war die Frage der intergenerationellen Gerechtigkeit und wie die Rechte zukünftiger Generationen gegen heutige wirtschaftliche Interessen abzuwägen sind.'
            },
            
            citizenImpact: {
                shortSummary: 'Diese wegweisende Entscheidung verpflichtet die Bundesregierung zu verstärkten Klimaschutzmaßnahmen und gibt Bürgern das Recht, unzureichende Klimapolitik gerichtlich anzufechten. Sie hat fundamentale Auswirkungen auf Energie-, Verkehrs- und Wirtschaftspolitik.',
                affectedGroups: ['Alle Bürger', 'Künftige Generationen', 'Unternehmen', 'Energiewirtschaft', 'Verkehrssektor', 'Landwirtschaft', 'Umweltverbände'],
                realWorldEffects: [
                    'Verschärfte Klimaschutzauflagen für alle Wirtschaftssektoren',
                    'Beschleunigter Ausstieg aus fossilen Brennstoffen',
                    'Strengere Emissionsgrenzwerte für Industrie und Verkehr',
                    'Möglichkeit, unzureichende Klimapolitik gerichtlich anzufechten',
                    'Erhöhte Investitionen in erneuerbare Energien und Klimaanpassung',
                    'Potenzielle Auswirkungen auf Lebenshaltungskosten und Wirtschaftsstruktur'
                ],
                immediateChanges: 'Die Bundesregierung muss ihre Klimaschutzmaßnahmen überprüfen und gegebenenfalls nachschärfen. Das Klimaschutzgesetz muss möglicherweise novelliert werden. Neue Gesetze und Verordnungen müssen auf Klimaverträglichkeit geprüft werden.',
                longTermImplications: 'Diese Entscheidung wird die deutsche Wirtschaft und Gesellschaft tiefgreifend transformieren. Sie könnte Deutschland zu einem Vorreiter beim Klimaschutz machen und international als Vorbild dienen. Gleichzeitig werden erhebliche Anpassungen in allen Lebensbereichen erforderlich sein. Die Entscheidung stärkt die Rolle der Gerichte im Klimaschutz und könnte ähnliche Entwicklungen in anderen Ländern anstoßen.'
            },
            
            relatedCases: ['BVerfGE 157, 30 (Klimabeschluss 2021)', 'BVerfGE 118, 79 (Umweltschutz)'],
            fullOpinionUrl: 'https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2024/06/rs20240607_1bvr265623_demo.html',
            
            citizenContact: {
                intro: 'Diese historische Entscheidung gibt Ihnen mächtige Werkzeuge, um auf Klimapolitik Einfluss zu nehmen. Sie können unzureichende Maßnahmen gerichtlich anfechten, Ihre Abgeordneten kontaktieren und sich für ambitionierten Klimaschutz einsetzen.',
                email: 'bverfg@bundesverfassungsgericht.de',
                phone: '+49-721-9101-0',
                website: 'https://www.bundesregierung.de/breg-de/service/kontakt',
                mailingAddress: 'Bundesverfassungsgericht\nSchloßbezirk 3\n76131 Karlsruhe\nDeutschland',
                tips: [
                    'Kontaktieren Sie Bundestagsabgeordnete und fordern Sie ambitionierte Klimapolitik',
                    'Beteiligen Sie sich an Konsultationen zum Klimaschutzgesetz',
                    'Schließen Sie sich Klimaklagen an oder unterstützen Sie diese',
                    'Engagieren Sie sich in Umweltverbänden, die diese Entscheidung nutzen',
                    'Teilen Sie konkrete Beispiele, wie Klimawandel Sie betrifft',
                    'Fordern Sie von Ihrer Kommune ambitionierte Klimaschutzmaßnahmen',
                    'Nutzen Sie Ihr Wahlrecht, um klimafreundliche Politik zu unterstützen'
                ]
            }
        }
    ]
};
END OF DEMO DATA */

let STATE_SUPREME_COURT_DECISIONS = {}; 
/* DEMO DATA REMOVED - Backend integration pending
   OLD DATA WAS HERE:
        texas: [
            {
                id: 'tx-supreme-2024-001',
                country: 'us',
                state: 'texas',
                courtName: 'Supreme Court of Texas',
                caseName: 'Texas Teachers Union v. State Board of Education',
                docketNumber: 'No. 23-0456',
                decisionDate: '2024-05-15',
                voteCount: { majority: 5, dissent: 4 },
                topic: 'labor',
                impactAreas: ['education', 'workers-rights', 'collective-bargaining'],
                
                majorityOpinion: {
                    author: 'Justice Maria Gonzalez',
                    summary: 'The Court held that public school teachers have the right to collectively bargain over wages and working conditions under the Texas Constitution. The state cannot prohibit teachers from organizing or negotiating as a group.',
                    keyPoints: [
                        'Teachers have constitutional right to organize and bargain collectively',
                        'State law prohibiting teacher collective bargaining is unconstitutional',
                        'School districts must negotiate in good faith with teacher unions'
                    ],
                    legalReasoning: 'The Texas Constitution protects the right of workers to organize for mutual aid and protection. This fundamental right extends to public employees, including teachers, and cannot be abridged by state legislation without compelling justification.'
                },
                
                dissentingOpinion: {
                    authors: ['Justice Robert Davis', 'Justice Sarah Chen', 'Justice Michael Torres', 'Justice David Kim'],
                    summary: 'The dissent argues that public employment is fundamentally different from private employment and that the legislature has the authority to set terms for public sector labor relations.',
                    keyPoints: [
                        'Public sector employment differs from private sector',
                        'Legislature has broad authority over public employment terms',
                        'Fiscal impact on taxpayers justifies restrictions'
                    ],
                    concerns: 'The dissent worries this ruling will lead to increased costs for school districts and taxpayers, and may disrupt the balance between educational quality and fiscal responsibility.'
                },
                
                deliberation: {
                    mainQuestions: [
                        'Does the Texas Constitution protect public sector collective bargaining?',
                        'Can the state prohibit teachers from organizing?',
                        'What is the scope of legislative authority over public employment?'
                    ],
                    keyDebates: 'The Court extensively debated whether the constitutional right to organize applies equally to public and private sector workers. Justices discussed the fiscal implications of requiring collective bargaining with public employees and whether such policy decisions should be left to the legislature.'
                },
                
                citizenImpact: {
                    shortSummary: 'This decision allows Texas teachers to form unions and collectively bargain for better pay, benefits, and working conditions. It could lead to improved teacher compensation and retention across the state.',
                    affectedGroups: ['Public school teachers (350,000+ in Texas)', 'School districts', 'Students and parents', 'Taxpayers', 'Teacher unions'],
                    realWorldEffects: [
                        'Teachers can now organize unions and bargain collectively',
                        'School districts must negotiate with teacher representatives',
                        'Potential for improved teacher pay and benefits',
                        'May lead to higher education funding needs',
                        'Could improve teacher retention and recruitment'
                    ],
                    immediateChanges: 'Teachers can immediately begin forming unions or joining existing organizations. School districts must establish procedures for collective bargaining negotiations.',
                    longTermImplications: 'This could transform Texas public education by empowering teachers, potentially leading to higher salaries, better benefits, and improved working conditions. May also increase education costs and property taxes to fund negotiated agreements.'
                },
                
                relatedCases: ['Janus v. AFSCME (2018)', 'Abood v. Detroit Board of Education (1977)'],
                fullOpinionUrl: 'https://www.txcourts.gov/supreme/opinions-orders/',
                
                citizenContact: {
                    intro: 'Share your views on teacher collective bargaining with the Texas Supreme Court, your state legislators, and the State Board of Education.',
                    email: 'supreme.court@txcourts.gov',
                    phone: '+1-512-463-1312',
                    website: 'https://www.txcourts.gov/supreme/public-information/',
                    mailingAddress: 'Supreme Court of Texas\nP.O. Box 12248\nAustin, TX 78711',
                    tips: [
                        'Contact your state representative and senator about education funding',
                        'Attend local school board meetings to voice your opinion',
                        'Share how teacher compensation affects your community',
                        'Join or support education advocacy organizations',
                        'Provide specific examples of teacher shortages in your area'
                    ]
                }
            },
            {
                id: 'tx-supreme-2024-002',
                country: 'us',
                state: 'texas',
                courtName: 'Supreme Court of Texas',
                caseName: 'Environmental Defense Coalition v. Texas Railroad Commission',
                docketNumber: 'No. 23-0789',
                decisionDate: '2024-03-22',
                voteCount: { majority: 6, dissent: 3 },
                topic: 'environment',
                impactAreas: ['climate-change', 'energy', 'regulation'],
                
                majorityOpinion: {
                    author: 'Justice Emily Martinez',
                    summary: 'The Court held that the Railroad Commission has authority to regulate methane emissions from oil and gas operations under existing environmental statutes.',
                    keyPoints: [
                        'Railroad Commission can regulate greenhouse gas emissions',
                        'Existing statutory authority includes air quality protection',
                        'Economic considerations do not override environmental mandates'
                    ],
                    legalReasoning: 'The Legislature granted the Railroad Commission broad authority to protect air quality and public health. This authority necessarily includes regulation of methane and other harmful emissions from oil and gas operations.'
                },
                
                dissentingOpinion: {
                    authors: ['Justice Robert Davis', 'Justice James Wilson', 'Justice Patricia Moore'],
                    summary: 'The dissent argues that the Legislature did not explicitly authorize greenhouse gas regulation and such significant economic decisions require clear legislative direction.',
                    keyPoints: [
                        'No explicit legislative authorization for methane regulation',
                        'Major questions require clear Congressional intent',
                        'Significant economic impact requires legislative decision'
                    ],
                    concerns: 'Concerns about regulatory overreach and economic impact on Texas energy industry without explicit legislative authorization.'
                },
                
                deliberation: {
                    mainQuestions: [
                        'Does the Railroad Commission have authority to regulate methane emissions?',
                        'Is explicit legislative authorization required for greenhouse gas regulation?',
                        'How should courts balance environmental protection with economic concerns?'
                    ],
                    keyDebates: 'Justices debated the scope of agency authority under existing statutes and whether new environmental challenges require new legislative authorization or fall within existing regulatory frameworks.'
                },
                
                citizenImpact: {
                    shortSummary: 'This decision allows Texas to regulate methane emissions from oil and gas operations, potentially improving air quality and reducing climate impact while affecting energy industry operations.',
                    affectedGroups: ['Texas residents (air quality)', 'Oil and gas companies', 'Energy workers', 'Environmental advocates', 'Rural communities near drilling sites'],
                    realWorldEffects: [
                        'Stricter methane emission standards for oil and gas operations',
                        'Improved air quality in areas near drilling sites',
                        'Potential equipment upgrade costs for energy companies',
                        'Reduced greenhouse gas emissions from Texas energy sector',
                        'May affect energy production costs and jobs'
                    ],
                    immediateChanges: 'Railroad Commission can now implement methane regulations. Energy companies may need to update equipment and practices to comply with new standards.',
                    longTermImplications: 'Could significantly reduce Texas greenhouse gas emissions while potentially increasing energy production costs. May accelerate transition to cleaner extraction methods and technology.'
                },
                
                relatedCases: ['Massachusetts v. EPA (2007)', 'West Virginia v. EPA (2022)'],
                fullOpinionUrl: 'https://www.txcourts.gov/supreme/opinions-orders/',
                
                citizenContact: {
                    intro: 'Share your views on environmental regulation and energy policy with Texas officials.',
                    email: 'supreme.court@txcourts.gov',
                    phone: '+1-512-463-1312',
                    website: 'https://www.rrc.texas.gov/about-us/contact-us/',
                    mailingAddress: 'Supreme Court of Texas\nP.O. Box 12248\nAustin, TX 78711',
                    tips: [
                        'Contact the Railroad Commission with specific air quality concerns',
                        'Share how oil and gas operations affect your community health',
                        'Provide data on local air quality and health impacts',
                        'Engage with both environmental and energy industry groups',
                        'Attend Railroad Commission public hearings'
                    ]
                }
            }
        ],
        california: [
            {
                id: 'ca-supreme-2024-001',
                country: 'us',
                state: 'california',
                courtName: 'Supreme Court of California',
                caseName: 'California Gig Workers Alliance v. State of California',
                docketNumber: 'S267890',
                decisionDate: '2024-06-01',
                voteCount: { majority: 5, dissent: 2 },
                topic: 'labor',
                impactAreas: ['workers-rights', 'gig-economy', 'employment'],
                
                majorityOpinion: {
                    author: 'Justice Leondra Kruger',
                    summary: 'The Court upheld AB 5, ruling that most gig workers must be classified as employees rather than independent contractors, ensuring minimum wage, benefits, and workplace protections.',
                    keyPoints: [
                        'ABC test for employee classification is constitutional',
                        'Gig workers performing core business functions are employees',
                        'Companies cannot circumvent labor protections through contracting'
                    ],
                    legalReasoning: 'The ABC test properly balances worker protection with business flexibility. Workers performing services integral to a company\'s business should receive employee protections and benefits.'
                },
                
                dissentingOpinion: {
                    authors: ['Justice Joshua Groban', 'Justice Patricia Guerrero'],
                    summary: 'The dissent argues the ruling eliminates flexible work arrangements that many gig workers prefer and may reduce overall employment opportunities.',
                    keyPoints: [
                        'Many workers prefer independent contractor status',
                        'May reduce flexible work opportunities',
                        'One-size-fits-all approach ignores worker preferences'
                    ],
                    concerns: 'Concerns that mandatory employee classification may reduce work opportunities and eliminate flexibility that attracts workers to gig economy platforms.'
                },
                
                deliberation: {
                    mainQuestions: [
                        'Is the ABC test constitutional?',
                        'How should courts classify gig economy workers?',
                        'Can companies offer flexible work while providing employee benefits?'
                    ],
                    keyDebates: 'Extensive debate on balancing worker protection with business innovation and worker flexibility. Justices discussed whether modern work arrangements require new legal frameworks.'
                },
                
                citizenImpact: {
                    shortSummary: 'This decision ensures that most California gig workers receive employee benefits including minimum wage, health insurance, paid time off, and unemployment insurance.',
                    affectedGroups: ['Gig workers (1.5M+ in California)', 'Platform companies', 'Traditional employees', 'Consumers of delivery/rideshare services'],
                    realWorldEffects: [
                        'Gig workers receive minimum wage and overtime pay',
                        'Access to health insurance and benefits',
                        'Unemployment and disability insurance coverage',
                        'Workers compensation for injuries',
                        'Potential service price increases for consumers'
                    ],
                    immediateChanges: 'Platform companies must reclassify most workers as employees. Workers gain immediate access to wage protections and can file for benefits.',
                    longTermImplications: 'Could fundamentally reshape the gig economy in California, providing better protections for workers while potentially increasing costs and reducing flexibility. May serve as model for other states.'
                },
                
                relatedCases: ['Dynamex Operations West, Inc. v. Superior Court (2018)', 'Vazquez v. Jan-Pro Franchising International, Inc. (2021)'],
                fullOpinionUrl: 'https://www.courts.ca.gov/opinions.htm',
                
                citizenContact: {
                    intro: 'Share your experience with gig work and views on worker classification with California officials.',
                    email: 'publicinfo@courts.ca.gov',
                    phone: '+1-415-865-7000',
                    website: 'https://www.courts.ca.gov/contact.htm',
                    mailingAddress: 'Supreme Court of California\n350 McAllister Street\nSan Francisco, CA 94102',
                    tips: [
                        'Contact your state legislators about gig economy regulations',
                        'Share your personal experience as a gig worker',
                        'Provide specific examples of how classification affects you',
                        'Engage with labor and gig worker advocacy groups',
                        'Participate in Labor Commissioner public forums'
                    ]
                }
            }
        ],
        new_york: [
            {
                id: 'ny-supreme-2024-001',
                country: 'us',
                state: 'new_york',
                courtName: 'New York Court of Appeals',
                caseName: 'Tenant Rights Coalition v. City of New York',
                docketNumber: 'APL-2023-00089',
                decisionDate: '2024-04-10',
                voteCount: { majority: 6, dissent: 1 },
                topic: 'housing',
                impactAreas: ['housing-rights', 'civil-rights', 'economy'],
                
                majorityOpinion: {
                    author: 'Chief Judge Rowan Wilson',
                    summary: 'The Court upheld strengthened rent control measures, ruling that housing is a fundamental right that justifies significant regulation of the rental market to protect tenants.',
                    keyPoints: [
                        'Housing stability is a fundamental right under NY Constitution',
                        'Rent control measures are constitutional',
                        'Landlord property rights must be balanced with tenant protections'
                    ],
                    legalReasoning: 'The housing crisis in New York creates extraordinary circumstances justifying strong rent regulations. The Constitution\'s social welfare provisions support protecting tenants from displacement and ensuring housing stability.'
                },
                
                dissentingOpinion: {
                    authors: ['Justice Jenny Rivera'],
                    summary: 'The dissent argues that while tenant protection is important, the regulations go too far in restricting property owners\' rights and may discourage housing development.',
                    keyPoints: [
                        'Regulations may discourage new housing construction',
                        'Property rights require stronger protection',
                        'Market-based solutions should be considered'
                    ],
                    concerns: 'Concerns that excessive regulation may reduce housing supply by discouraging development and conversion of properties to rental housing.'
                },
                
                deliberation: {
                    mainQuestions: [
                        'Is housing a fundamental right under the NY Constitution?',
                        'How far can rent control go before violating property rights?',
                        'Do current regulations adequately balance tenant and landlord interests?'
                    ],
                    keyDebates: 'Intensive debate on balancing tenant protection with property rights and whether strong regulations help or hurt housing availability. Justices considered national housing crisis and New York\'s unique challenges.'
                },
                
                citizenImpact: {
                    shortSummary: 'This decision strengthens rent control protections, limiting rent increases and providing greater security for tenants in rent-stabilized apartments across New York.',
                    affectedGroups: ['Rent-stabilized tenants (1M+ in NYC)', 'Landlords', 'Prospective renters', 'Real estate developers', 'Homeless populations'],
                    realWorldEffects: [
                        'Stricter limits on rent increases',
                        'Stronger protections against eviction',
                        'Enhanced tenant rights to renew leases',
                        'Greater stability for long-term tenants',
                        'Potential reduction in luxury development'
                    ],
                    immediateChanges: 'Rent increases are immediately capped at lower levels. Tenants in rent-stabilized units have stronger lease renewal rights and eviction protections.',
                    longTermImplications: 'Could preserve affordable housing for existing tenants while potentially reducing new construction. May require expanded public housing investment to address ongoing housing shortages.'
                },
                
                relatedCases: ['Yee v. City of Escondido (1992)', 'FCC v. Florida Power Corp. (1987)'],
                fullOpinionUrl: 'https://www.nycourts.gov/ctapps/',
                
                citizenContact: {
                    intro: 'Share your housing experiences and views on rent control with New York officials.',
                    email: 'capio@nycourts.gov',
                    phone: '+1-518-455-7700',
                    website: 'https://www.nycourts.gov/ctapps/contact.shtml',
                    mailingAddress: 'New York Court of Appeals\n20 Eagle Street\nAlbany, NY 12207',
                    tips: [
                        'Contact your city council member about housing policy',
                        'Share your experience with rent increases and housing insecurity',
                        'Provide specific data on neighborhood rent trends',
                        'Engage with tenant rights and affordable housing groups',
                        'Attend housing policy public hearings'
                    ]
                }
            }
        ]
    },
    au: {
        new_south_wales: [
            {
                id: 'nsw-supreme-2024-001',
                country: 'au',
                state: 'new_south_wales',
                courtName: 'Supreme Court of New South Wales',
                caseName: 'Australian Workers Union v. State Government',
                docketNumber: '[2024] NSWSC 156',
                decisionDate: '2024-05-20',
                voteCount: { majority: 4, dissent: 1 },
                topic: 'labor',
                impactAreas: ['workers-rights', 'industrial-relations', 'employment'],
                
                majorityOpinion: {
                    author: 'Justice Sarah Mitchell',
                    summary: 'The Court held that enterprise agreements must include minimum wage protections and cannot trade away fundamental workplace rights, even with worker consent.',
                    keyPoints: [
                        'Enterprise agreements cannot waive minimum wage protections',
                        'Fundamental workplace rights are non-negotiable',
                        'Fair Work Act provisions are mandatory minimums'
                    ],
                    legalReasoning: 'The Fair Work Act establishes minimum standards that form the safety net for all Australian workers. These protections cannot be bargained away through enterprise agreements, as they serve broader public policy objectives beyond individual contract negotiations.'
                },
                
                dissentingOpinion: {
                    authors: ['Justice Robert Chen'],
                    summary: 'The dissent argues that workers should have autonomy to negotiate agreements that best suit their circumstances, including trading some protections for higher pay or better conditions in other areas.',
                    keyPoints: [
                        'Worker autonomy in negotiations should be respected',
                        'Flexibility benefits both employers and employees',
                        'One-size-fits-all approach may reduce employment opportunities'
                    ],
                    concerns: 'Rigid protections may limit innovative workplace arrangements and reduce employer willingness to offer flexible work options.'
                },
                
                deliberation: {
                    mainQuestions: [
                        'Can workers negotiate away statutory minimum protections?',
                        'What is the scope of enterprise bargaining under Fair Work Act?',
                        'How should courts balance worker autonomy with protection?'
                    ],
                    keyDebates: 'The Court debated the tension between worker autonomy in negotiations and the need for minimum standards to prevent exploitation. Justices considered international labor standards and the history of Australian industrial relations law.'
                },
                
                citizenImpact: {
                    shortSummary: 'This decision strengthens minimum wage protections in NSW, ensuring workers cannot sign away fundamental rights even in enterprise agreements.',
                    affectedGroups: ['Workers under enterprise agreements', 'Unions', 'Employers', 'Fair Work Commission'],
                    realWorldEffects: [
                        'Stronger minimum wage protections across all industries',
                        'Enterprise agreements must meet minimum standards',
                        'Greater job security and workplace rights',
                        'May affect workplace flexibility negotiations',
                        'Protects vulnerable workers from exploitative agreements'
                    ],
                    immediateChanges: 'Existing enterprise agreements that fall below minimum standards must be renegotiated. Workers can challenge agreements that traded away fundamental rights.',
                    longTermImplications: 'Could reshape industrial relations by establishing clearer boundaries for enterprise bargaining. May lead to more standardized workplace conditions while potentially reducing some flexible arrangements.'
                },
                
                relatedCases: ['WorkPac Pty Ltd v Rossato [2020] FCAFC 84', 'ZG Operations Australia Pty Ltd v Jamsek [2022] HCA 2'],
                fullOpinionUrl: 'https://www.caselaw.nsw.gov.au/',
                
                citizenContact: {
                    intro: 'Share your views on workplace rights and industrial relations with NSW officials and Fair Work Commission.',
                    email: 'enquiries@justice.nsw.gov.au',
                    phone: '+61-2-9230-8111',
                    website: 'https://www.fwc.gov.au/about-us/contact-us',
                    mailingAddress: 'Supreme Court of NSW\nQueens Square\nSydney NSW 2000',
                    tips: [
                        'Contact Fair Work Commission about enterprise agreement concerns',
                        'Share your workplace experiences with your union',
                        'Provide specific examples of workplace issues',
                        'Engage with industrial relations advocacy groups',
                        'Attend Fair Work Commission consultations'
                    ]
                }
            }
        ],
        victoria: [
            {
                id: 'vic-supreme-2024-001',
                country: 'au',
                state: 'victoria',
                courtName: 'Supreme Court of Victoria',
                caseName: 'Environmental Victoria v. State Government',
                docketNumber: '[2024] VSC 234',
                decisionDate: '2024-04-15',
                voteCount: { majority: 5, dissent: 0 },
                topic: 'environment',
                impactAreas: ['climate-change', 'environmental-protection', 'energy'],
                
                majorityOpinion: {
                    author: 'Justice Patricia Wong',
                    summary: 'The Court held that the Victorian government must consider climate change impacts in all major development approvals, establishing climate impact assessment as mandatory.',
                    keyPoints: [
                        'Climate impact assessments are mandatory for major developments',
                        'Government has duty of care for climate change mitigation',
                        'Environmental Protection Act requires consideration of future generations'
                    ],
                    legalReasoning: 'The Environment Protection Act imposes a duty to protect the environment for current and future generations. Climate change is an environmental impact that must be considered in all significant planning and development decisions.'
                },
                
                dissentingOpinion: null,
                
                deliberation: {
                    mainQuestions: [
                        'Does the Environmental Protection Act require climate impact assessments?',
                        'What is the scope of government duty regarding climate change?',
                        'How should courts balance development with climate concerns?'
                    ],
                    keyDebates: 'The Court unanimously agreed that climate change impacts must be considered, focusing on practical implementation mechanisms and the scope of assessment requirements.'
                },
                
                citizenImpact: {
                    shortSummary: 'All major development projects in Victoria must now assess and disclose climate change impacts, strengthening environmental protection.',
                    affectedGroups: ['Victorian residents', 'Developers', 'Environmental groups', 'Planning authorities'],
                    realWorldEffects: [
                        'All major developments require climate impact assessments',
                        'Greater scrutiny of high-emission projects',
                        'Potential delays in development approvals',
                        'Stronger environmental protections',
                        'May accelerate transition to low-emission developments'
                    ],
                    immediateChanges: 'Planning authorities must now require climate impact statements for all major developments. Existing pending approvals may need additional assessment.',
                    longTermImplications: 'Could significantly reduce Victoria\'s emissions by preventing high-impact developments and encouraging sustainable building practices. May serve as model for other Australian states.'
                },
                
                relatedCases: ['Sharma v Minister for the Environment [2021] FCA 560', 'Gloucester Resources Limited v Minister for Planning [2019] NSWLEC 7'],
                fullOpinionUrl: 'https://www.austlii.edu.au/au/cases/vic/VSC/',
                
                citizenContact: {
                    intro: 'Share your views on climate policy and development with Victorian authorities.',
                    email: 'supreme.court@courts.vic.gov.au',
                    phone: '+61-3-9603-6111',
                    website: 'https://www.epa.vic.gov.au/about-epa/contact-epa',
                    mailingAddress: 'Supreme Court of Victoria\n436 Lonsdale Street\nMelbourne VIC 3000',
                    tips: [
                        'Contact EPA Victoria about specific development concerns',
                        'Participate in planning consultations for major projects',
                        'Provide data on local climate impacts',
                        'Engage with environmental advocacy organizations',
                        'Attend council meetings on development applications'
                    ]
                }
            }
        ]
    },
    ca: {
        ontario: [
            {
                id: 'on-supreme-2024-001',
                country: 'ca',
                state: 'ontario',
                courtName: 'Court of Appeal for Ontario',
                caseName: 'Ontario Healthcare Workers v. Province of Ontario',
                docketNumber: '2024 ONCA 123',
                decisionDate: '2024-06-10',
                voteCount: { majority: 2, dissent: 1 },
                topic: 'labor',
                impactAreas: ['healthcare', 'workers-rights', 'collective-bargaining'],
                
                majorityOpinion: {
                    author: 'Justice Katherine van Rensburg',
                    summary: 'The Court struck down wage caps for healthcare workers, ruling that Bill 124\'s restrictions on public sector wage increases violated Charter rights to freedom of association and collective bargaining.',
                    keyPoints: [
                        'Bill 124 wage caps are unconstitutional',
                        'Collective bargaining is a Charter-protected right',
                        'Government cannot arbitrarily limit wage negotiations'
                    ],
                    legalReasoning: 'Section 2(d) of the Charter protects meaningful collective bargaining. Arbitrary wage caps that effectively eliminate bargaining for compensation fundamentally undermine this constitutional right and cannot be justified under section 1.'
                },
                
                dissentingOpinion: {
                    authors: ['Justice David Brown'],
                    summary: 'The dissent argues that reasonable wage restraints during fiscal emergencies fall within government\'s authority to manage public finances.',
                    keyPoints: [
                        'Government has legitimate interest in fiscal management',
                        'Temporary wage restraints during crisis are reasonable',
                        'Does not eliminate collective bargaining, only limits scope'
                    ],
                    concerns: 'Unlimited public sector wage increases may harm fiscal stability and taxpayers, particularly during economic downturns.'
                },
                
                deliberation: {
                    mainQuestions: [
                        'Do wage caps violate Charter rights to collective bargaining?',
                        'Can government limit public sector wages during fiscal crisis?',
                        'What is the scope of constitutionally protected bargaining?'
                    ],
                    keyDebates: 'Justices debated balancing fiscal responsibility with workers\' constitutional rights, considering whether the wage caps substantially interfered with meaningful collective bargaining.'
                },
                
                citizenImpact: {
                    shortSummary: 'Healthcare and public sector workers can now negotiate wages without provincial caps, potentially leading to better compensation for nurses, teachers, and other public employees.',
                    affectedGroups: ['Healthcare workers (500,000+)', 'Teachers', 'Public sector employees', 'Taxpayers', 'Patients'],
                    realWorldEffects: [
                        'Healthcare workers can negotiate higher wages',
                        'Potential for significant wage increases in public sector',
                        'May improve healthcare worker retention',
                        'Could increase provincial budget pressures',
                        'Stronger collective bargaining rights across public sector'
                    ],
                    immediateChanges: 'Unions can reopen wage negotiations. Workers may receive retroactive pay increases for wages suppressed under Bill 124.',
                    longTermImplications: 'Could improve recruitment and retention in healthcare and education sectors. May increase public sector costs but could enhance service quality through better-compensated workforce.'
                },
                
                relatedCases: ['Ontario (Attorney General) v. Fraser [2011] 2 SCR 3', 'Saskatchewan Federation of Labour v. Saskatchewan [2015] 1 SCR 245'],
                fullOpinionUrl: 'https://www.ontariocourts.ca/decisions/',
                
                citizenContact: {
                    intro: 'Share your views on public sector compensation and healthcare funding with Ontario officials.',
                    email: 'MAG-Communications@ontario.ca',
                    phone: '+1-416-326-2220',
                    website: 'https://www.ontario.ca/page/contact-ontario-government',
                    mailingAddress: 'Court of Appeal for Ontario\nOsgoode Hall\n130 Queen Street West\nToronto, ON M5H 2N5',
                    tips: [
                        'Contact your MPP about healthcare funding priorities',
                        'Share your healthcare access experiences',
                        'Provide input on budget consultations',
                        'Engage with healthcare worker unions and associations',
                        'Participate in town halls on public services'
                    ]
                }
            }
        ],
        quebec: [
            {
                id: 'qc-supreme-2024-001',
                country: 'ca',
                state: 'quebec',
                courtName: 'Court of Appeal of Quebec',
                caseName: 'Coalition pour la laïcité v. Procureur général du Québec',
                docketNumber: '2024 QCCA 89',
                decisionDate: '2024-03-25',
                voteCount: { majority: 3, dissent: 0 },
                topic: 'civil-rights',
                impactAreas: ['religious-freedom', 'employment', 'civil-liberties'],
                
                majorityOpinion: {
                    author: 'Justice Marie-France Bich',
                    summary: 'The Court upheld Bill 21\'s restrictions on religious symbols for public sector workers, ruling that Quebec\'s secularism law is a valid exercise of provincial authority under the notwithstanding clause.',
                    keyPoints: [
                        'Bill 21 is constitutional under notwithstanding clause',
                        'Quebec has authority to define state secularism',
                        'Applies to public-facing government workers in positions of authority'
                    ],
                    legalReasoning: 'Quebec validly invoked the notwithstanding clause to protect Bill 21 from Charter challenges. The law represents a legitimate exercise of Quebec\'s jurisdiction over education and provincial public service, reflecting the province\'s distinct approach to secularism.'
                },
                
                dissentingOpinion: null,
                
                deliberation: {
                    mainQuestions: [
                        'Is Bill 21 constitutional under the notwithstanding clause?',
                        'Does Quebec have authority to regulate religious expression in public service?',
                        'How should courts balance secularism with religious freedom?'
                    ],
                    keyDebates: 'The Court focused on the scope of provincial authority and the proper use of the notwithstanding clause, rather than the substantive rights implications.'
                },
                
                citizenImpact: {
                    shortSummary: 'Public sector workers in positions of authority (teachers, police, judges) cannot wear visible religious symbols while working, affecting personal expression in the workplace.',
                    affectedGroups: ['Public sector workers', 'Religious minorities', 'Students', 'Quebec residents'],
                    realWorldEffects: [
                        'Teachers, police, judges cannot wear religious symbols at work',
                        'Affects hiring and career choices for religious minorities',
                        'May limit workforce diversity in public service',
                        'Affects Muslim women wearing hijab, Sikh men wearing turbans, others',
                        'Creates different employment standards than rest of Canada'
                    ],
                    immediateChanges: 'Public sector workers must comply with religious symbol restrictions or face discipline. Some workers may need to change careers or move to other provinces.',
                    longTermImplications: 'Could reshape Quebec\'s public sector workforce composition. May face ongoing Charter challenges and affect Quebec\'s relationship with religious communities and other provinces.'
                },
                
                relatedCases: ['R. v. Big M Drug Mart Ltd. [1985] 1 SCR 295', 'Mouvement laïque québécois v. Saguenay (City) [2015] 2 SCR 3'],
                fullOpinionUrl: 'https://www.jugements.qc.ca/',
                
                citizenContact: {
                    intro: 'Partagez vos opinions sur la laïcité et les droits religieux avec les autorités québécoises. Share your views on secularism and religious rights with Quebec authorities.',
                    email: 'communications@justice.gouv.qc.ca',
                    phone: '+1-418-643-5140',
                    website: 'https://www.quebec.ca/gouvernement/contactez-nous',
                    mailingAddress: 'Cour d\'appel du Québec\n100, rue Notre-Dame Est\nMontréal, QC H2Y 1C1',
                    tips: [
                        'Contactez votre député sur la laïcité / Contact your MNA about secularism',
                        'Partagez vos expériences personnelles / Share your personal experiences',
                        'Participez aux consultations publiques / Participate in public consultations',
                        'Engagez avec les organisations de droits civils / Engage with civil rights organizations',
                        'Assistez aux audiences de la commission / Attend commission hearings'
                    ]
                }
            }
        }
    }
};
END OF DEMO DATA */

let SAMPLE_STATE_GOVERNMENT = {}; 
/* DEMO DATA REMOVED - Backend integration pending
   OLD DATA WAS HERE:
        texas: {
            name: 'Texas',
            capital: 'Austin',
            representatives: [
                {
                    id: 'tx-state-001',
                    name: 'Maria Rodriguez',
                    title: 'State Representative',
                    party: 'Democratic Party',
                    district: 'District 45 - Austin Area',
                    chamber: 'House',
                    committees: ['Education', 'Labor & Workers Compensation', 'Public Health'],
                    photo: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=MR',
                    email: 'maria.rodriguez@house.texas.gov',
                    phone: '+1-512-555-0145',
                    website: 'https://house.texas.gov/members/district-45',
                    yearsServed: 6,
                    votingRecord: {
                        education: 95,
                        workers_rights: 92,
                        healthcare: 88,
                        environment: 85,
                        housing: 90
                    },
                    recentVotes: [
                        {
                            id: 'tx-bill-001',
                            billNumber: 'HB 2147',
                            billName: 'Texas Worker Protection and Fair Wage Act',
                            date: '2024-05-15',
                            vote: 'yes',
                            summary: 'Raises minimum wage to $15/hour and strengthens workplace safety standards for all Texas workers',
                            impact: 'Affects 2.5 million Texas workers, providing pay increases and stronger safety protections',
                            status: 'Passed House, In Senate Committee'
                        },
                        {
                            id: 'tx-bill-002',
                            billNumber: 'HB 1893',
                            billName: 'Public Education Funding Enhancement',
                            date: '2024-05-10',
                            vote: 'yes',
                            summary: 'Increases per-student funding by 20% and provides $500 million for teacher salaries',
                            impact: 'Benefits 5.4 million Texas students and 360,000 teachers statewide',
                            status: 'Passed House, Awaiting Senate Vote'
                        },
                        {
                            id: 'tx-bill-003',
                            billNumber: 'HB 2456',
                            billName: 'Affordable Housing Development Initiative',
                            date: '2024-04-28',
                            vote: 'yes',
                            summary: 'Allocates $2 billion for affordable housing construction and rental assistance programs',
                            impact: 'Could create 50,000 new affordable housing units across Texas over 5 years',
                            status: 'Signed into Law'
                        },
                        {
                            id: 'tx-bill-004',
                            billNumber: 'HB 3012',
                            billName: 'Corporate Tax Reduction Act',
                            date: '2024-04-15',
                            vote: 'no',
                            summary: 'Reduces corporate tax rates for large businesses operating in Texas',
                            impact: 'Critics argue this reduces state revenue by $3 billion, affecting public services',
                            status: 'Passed House and Senate, Signed into Law'
                        }
                    ]
                }
            ],
            bills: [
                {
                    id: 'tx-bill-001',
                    billNumber: 'HB 2147',
                    title: 'Texas Worker Protection and Fair Wage Act',
                    sponsor: 'Rep. Maria Rodriguez',
                    status: 'Passed House, In Senate Committee',
                    introduced: '2024-03-01',
                    lastAction: '2024-05-20',
                    topic: 'labor',
                    summary: 'This comprehensive workers\' rights bill raises the state minimum wage to $15/hour over two years and implements stronger workplace safety standards. It also provides protections for workers who report safety violations.',
                    keyProvisions: [
                        'Minimum wage increase to $15/hour by 2026',
                        'Mandatory paid sick leave (7 days per year)',
                        'Stronger whistleblower protections',
                        'Enhanced workplace safety inspections',
                        'Penalties for wage theft increased'
                    ],
                    impact: {
                        workers: '2.5 million workers would receive pay increases',
                        businesses: 'Small businesses receive tax credits to offset increased labor costs',
                        economy: 'Estimated $4.2 billion in additional wages circulating in Texas economy',
                        timeline: 'Phase 1: $12/hour (2025), Phase 2: $15/hour (2026)'
                    },
                    voteTally: {
                        house: { yes: 82, no: 68 },
                        senate: { status: 'In Committee' }
                    }
                }
            ]
        },
        california: {
            name: 'California',
            capital: 'Sacramento',
            representatives: [
                {
                    id: 'ca-state-001',
                    name: 'James Chen',
                    title: 'State Senator',
                    party: 'Democratic Party',
                    district: 'District 11 - San Francisco Bay Area',
                    chamber: 'Senate',
                    committees: ['Labor & Industrial Relations', 'Environmental Quality', 'Housing'],
                    photo: 'https://via.placeholder.com/150/FF6B35/FFFFFF?text=JC',
                    email: 'james.chen@sen.ca.gov',
                    phone: '+1-916-555-0211',
                    website: 'https://sd11.senate.ca.gov',
                    yearsServed: 8,
                    votingRecord: {
                        labor: 98,
                        environment: 95,
                        housing: 92,
                        healthcare: 90,
                        education: 88
                    },
                    recentVotes: [
                        {
                            id: 'ca-bill-001',
                            billNumber: 'SB 421',
                            billName: 'California Gig Worker Rights Act',
                            date: '2024-06-01',
                            vote: 'yes',
                            summary: 'Extends employee status and benefits to gig economy workers including rideshare and delivery drivers',
                            impact: '1.2 million California gig workers gain employee protections, minimum wage guarantees, and benefits',
                            status: 'Passed Senate, In Assembly'
                        }
                    ]
                }
            ],
            bills: []
        }
    }
};
END OF DEMO DATA */

let SAMPLE_LOCAL_GOVERNMENT = {}; 
/* DEMO DATA REMOVED - Backend integration pending
   OLD DATA WAS HERE:
        austin_tx: {
            name: 'Austin, Texas',
            type: 'City Council',
            population: '978,908',
            officials: [
                {
                    id: 'austin-council-001',
                    name: 'Vanessa Martinez',
                    title: 'City Council Member',
                    district: 'District 3',
                    photo: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=VM',
                    email: 'vanessa.martinez@austintexas.gov',
                    phone: '+1-512-555-0303',
                    website: 'https://www.austintexas.gov/department/district-3',
                    yearsServed: 4,
                    committees: ['Housing & Planning', 'Economic Development', 'Public Safety'],
                    priorities: ['Affordable Housing', 'Public Transportation', 'Small Business Support'],
                    recentDecisions: [
                        {
                            id: 'austin-res-001',
                            type: 'City Resolution',
                            number: 'CR-2024-089',
                            title: 'Affordable Housing Preservation Ordinance',
                            date: '2024-06-10',
                            vote: 'for',
                            voteCount: { for: 9, against: 2 },
                            summary: 'Requires developers to include 15% affordable units in new residential projects over 50 units',
                            impact: 'Expected to create 3,000 affordable housing units over next 5 years in high-cost neighborhoods',
                            communityFeedback: '427 residents spoke in favor, 83 opposed at public hearing',
                            implementation: 'Takes effect January 2025 for all new projects'
                        },
                        {
                            id: 'austin-res-002',
                            type: 'Budget Resolution',
                            number: 'CR-2024-067',
                            title: 'Public Transportation Expansion Funding',
                            date: '2024-05-22',
                            vote: 'for',
                            voteCount: { for: 10, against: 1 },
                            summary: 'Allocates $125 million for new bus rapid transit lines connecting East Austin to downtown',
                            impact: 'Reduces commute times by 30% for 45,000 daily commuters; creates 200 transit jobs',
                            communityFeedback: '892 residents supported, 154 opposed; strong support from East Austin neighborhoods',
                            implementation: 'Construction begins Fall 2024, completion targeted for 2026'
                        },
                        {
                            id: 'austin-res-003',
                            type: 'City Ordinance',
                            number: 'OR-2024-045',
                            title: 'Small Business Relief and Support Package',
                            date: '2024-05-05',
                            vote: 'for',
                            voteCount: { for: 11, against: 0 },
                            summary: 'Provides grants up to $25,000 for small businesses affected by rising commercial rents',
                            impact: 'Helps 500 local businesses stay open; focuses on restaurants, retail, and service providers',
                            communityFeedback: '1,200+ business owners attended town hall; overwhelming support',
                            implementation: 'Applications open July 2024; funds distributed on rolling basis'
                        }
                    ]
                }
            ],
            recentMeetings: [
                {
                    date: '2024-06-20',
                    type: 'Regular Council Meeting',
                    agenda: ['Zoning changes for East Austin', 'Parks department budget review', 'Homeless services expansion'],
                    attendees: 11,
                    publicComments: 47,
                    videoUrl: 'https://austintexas.gov/council/meetings/2024-06-20'
                }
            ]
        },
        san_francisco_ca: {
            name: 'San Francisco, California',
            type: 'Board of Supervisors',
            population: '873,965',
            officials: [
                {
                    id: 'sf-supervisor-001',
                    name: 'David Wong',
                    title: 'Supervisor',
                    district: 'District 6 - Tenderloin, SOMA, Civic Center',
                    photo: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=DW',
                    email: 'david.wong@sfgov.org',
                    phone: '+1-415-555-0606',
                    website: 'https://sfbos.org/supervisor-wong',
                    yearsServed: 3,
                    committees: ['Housing', 'Homelessness & Supportive Services', 'Economic Development'],
                    priorities: ['Addressing Homelessness', 'Safe Injection Sites', 'Tenant Protections'],
                    recentDecisions: [
                        {
                            id: 'sf-ord-001',
                            type: 'City Ordinance',
                            number: 'ORD-2024-112',
                            title: 'Tenant Protection and Rent Stabilization Act',
                            date: '2024-06-15',
                            vote: 'for',
                            voteCount: { for: 9, against: 2 },
                            summary: 'Caps rent increases at 3% annually and provides stronger eviction protections for tenants',
                            impact: 'Protects 180,000 renter households from excessive rent increases; strengthens tenant rights',
                            communityFeedback: '2,100 residents testified; strong support from tenant advocacy groups',
                            implementation: 'Effective July 1, 2024'
                        }
                    ]
                }
            ],
            recentMeetings: []
        }
    }
};
END OF DEMO DATA */

let SAMPLE_BILLS = [];

// Data loading status
let civicDataLoaded = false;
let civicDataLoading = false;

/**
 * Ensures civic data is loaded before use
 * In production, this will fetch from backend APIs via civic-data-loader.js
 * Currently returns empty structures (backend integration pending)
 */
async function ensureCivicDataLoaded() {
    if (civicDataLoaded) {
        return;
    }
    
    if (civicDataLoading) {
        // Wait for existing load to complete
        return new Promise((resolve) => {
            window.addEventListener('civicDataLoaded', () => resolve(), { once: true });
        });
    }
    
    civicDataLoading = true;
    
    try {
        // Load data using the lazy loader (civic-data-loader.js)
        const data = await loadCivicData();
        
        // Assign loaded data to global variables
        SAMPLE_COURT_DECISIONS = data.SAMPLE_COURT_DECISIONS || {};
        STATE_SUPREME_COURT_DECISIONS = data.STATE_SUPREME_COURT_DECISIONS || {};
        SAMPLE_STATE_GOVERNMENT = data.SAMPLE_STATE_GOVERNMENT || {};
        SAMPLE_LOCAL_GOVERNMENT = data.SAMPLE_LOCAL_GOVERNMENT || {};
        SAMPLE_BILLS = data.SAMPLE_BILLS || [];
        
        civicDataLoaded = true;
        civicDataLoading = false;
        
        // Notify that data is loaded
        window.dispatchEvent(new CustomEvent('civicDataLoaded'));
        
        console.log('✅ Civic data loaded - ready for backend API integration');
    } catch (error) {
        console.error('❌ Error loading civic data:', error);
        civicDataLoading = false;
        throw error;
    }
}

// Preload data when civic section enters viewport (performance optimization)
if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !civicDataLoaded && !civicDataLoading) {
                console.log('📊 Civic section approaching - preloading data...');
                ensureCivicDataLoaded();
            }
        });
    }, {
        rootMargin: '500px' // Start loading when 500px away from viewport
    });
    
    // Observe civic section when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const civicSection = document.getElementById('civic');
            if (civicSection) {
                observer.observe(civicSection);
            }
        });
    } else {
        const civicSection = document.getElementById('civic');
        if (civicSection) {
            observer.observe(civicSection);
        }
    }
}

/* OLD DEMO DATA COMMENTED OUT (removed per user request - backend will provide real data)
   OLD DATA: [
        {
            id: 'bill-us-hb2147',
        country: 'us',
        level: 'state',
        state: 'texas',
        billNumber: 'HB 2147',
        title: 'Texas Worker Protection and Fair Wage Act',
        billType: 'labor',
        status: 'active',
        introduced: 'Rep. Maria Rodriguez (D-District 45)',
        voteDate: '2025-02-15',
        summary: 'This bill raises the minimum wage to $15/hour with phased implementation over 3 years. It includes tax credits for small businesses to offset costs and requires yearly cost-of-living adjustments. The bill aims to lift 2.5 million Texas workers out of poverty while supporting small business sustainability.',
        impact: '2.5 million Texas workers would receive immediate pay increases, bringing an additional $4.2 billion in wages annually into the economy. Small businesses (under 50 employees) would receive tax credits covering 60% of wage increases for the first two years.',
        affectedPopulation: 'Affects 2.5 million workers across Texas, particularly in retail, food service, and hospitality sectors',
        fullText: `SECTION 1. MINIMUM WAGE INCREASE
        
(a) The minimum wage in Texas shall be increased to $15.00 per hour according to the following schedule:
   - January 1, 2026: $12.00/hour
   - January 1, 2027: $13.50/hour
   - January 1, 2028: $15.00/hour

(b) After January 1, 2028, the minimum wage shall be adjusted annually based on the Consumer Price Index.

SECTION 2. SMALL BUSINESS TAX CREDITS

Businesses with fewer than 50 employees shall receive tax credits equal to 60% of the difference between the previous minimum wage and the new minimum wage for the first two years of implementation.

SECTION 3. ENFORCEMENT

The Texas Workforce Commission shall enforce this Act and may assess penalties of up to $1,000 per violation per employee for non-compliance.`,
        officialUrl: 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=88R&Bill=HB2147',
        representativeVotes: [
            {
                id: 'tx-state-001',
                name: 'Maria Rodriguez',
                party: 'Democratic Party',
                district: 'District 45',
                vote: 'yes',
                email: 'maria.rodriguez@house.texas.gov',
                phone: '+1-512-463-0000',
                billNumber: 'HB 2147'
            },
            {
                id: 'tx-state-002',
                name: 'James Chen',
                party: 'Democratic Party',
                district: 'District 12',
                vote: 'yes',
                email: 'james.chen@house.texas.gov',
                phone: '+1-512-463-0001',
                billNumber: 'HB 2147'
            },
            {
                id: 'tx-state-003',
                name: 'Robert Thompson',
                party: 'Republican Party',
                district: 'District 8',
                vote: 'no',
                email: 'robert.thompson@house.texas.gov',
                phone: '+1-512-463-0002',
                billNumber: 'HB 2147'
            },
            {
                id: 'tx-state-004',
                name: 'Sarah Mitchell',
                party: 'Republican Party',
                district: 'District 23',
                vote: 'no',
                email: 'sarah.mitchell@house.texas.gov',
                phone: '+1-512-463-0003',
                billNumber: 'HB 2147'
            }
        ]
    },
    {
        id: 'bill-us-sb421',
        country: 'us',
        level: 'state',
        state: 'california',
        billNumber: 'SB 421',
        title: 'California Gig Worker Rights and Benefits Act',
        billType: 'labor',
        status: 'upcoming',
        introduced: 'Sen. James Chen (D-District 11)',
        voteDate: '2025-03-01',
        summary: 'Establishes comprehensive benefits and protections for gig economy workers, including minimum earnings guarantees, health insurance subsidies, workers compensation, and paid time off. The bill reclassifies certain gig workers as employees while allowing flexibility in scheduling.',
        impact: 'Affects approximately 1.2 million gig workers in California, providing health benefits, minimum earning guarantees of $18/hour, and workplace injury protections. Estimated cost to companies: $1.8 billion annually.',
        affectedPopulation: 'Affects 1.2 million gig economy workers including rideshare drivers, delivery workers, and freelance contractors',
        fullText: `SECTION 1. GIG WORKER CLASSIFICATION

(a) Workers who perform services through digital platforms for more than 20 hours per week shall be classified as employees for purposes of benefits and protections under this Act.

(b) Workers may maintain flexible scheduling while receiving employee benefits.

SECTION 2. MINIMUM EARNINGS GUARANTEE

Platform companies must guarantee minimum earnings of $18.00 per hour of engaged time, calculated weekly.

SECTION 3. HEALTH AND BENEFITS

(a) Health insurance subsidies: Companies must provide $500/month toward health insurance for workers averaging 20+ hours/week.
(b) Paid time off: Workers earn 1 hour of paid time off for every 30 hours worked.
(c) Workers' compensation: Full coverage for work-related injuries.

SECTION 4. IMPLEMENTATION

This Act takes effect January 1, 2026.`,
        officialUrl: 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB421',
        representativeVotes: [] // Upcoming vote
    },
    {
        id: 'bill-us-hb3245',
        country: 'us',
        level: 'federal',
        billNumber: 'H.R. 3245',
        title: 'Education Funding and Teacher Support Act',
        billType: 'education',
        status: 'upcoming',
        introduced: 'Rep. Alexandria Morrison (D-NY-14)',
        voteDate: '2025-02-20',
        summary: 'Provides $50 billion in additional federal funding for public schools over 5 years, with focus on underserved communities. Includes teacher salary increases (minimum $60,000 nationally), universal free breakfast and lunch programs, and technology infrastructure upgrades.',
        impact: 'Would provide resources for 50 million students nationwide, raise teacher salaries by average of $12,000, and ensure every student has access to nutritious meals and modern technology.',
        affectedPopulation: 'Affects 50 million K-12 students, 3.7 million teachers, and 100,000 schools nationwide',
        fullText: `SECTION 1. EDUCATION FUNDING INCREASE

The Federal Government shall appropriate $50 billion over 5 years (FY2026-FY2030) for public K-12 education, distributed as follows:
- 40% to Title I schools (underserved communities)
- 30% to teacher salary improvements
- 20% to universal meal programs
- 10% to technology infrastructure

SECTION 2. TEACHER COMPENSATION

(a) States receiving funds under this Act must establish minimum teacher salaries of $60,000 annually for certified teachers with Bachelor's degrees.
(b) Cost-of-living adjustments for high-cost areas.

SECTION 3. UNIVERSAL MEAL PROGRAMS

All public schools must provide free breakfast and lunch to all students, regardless of family income.

SECTION 4. TECHNOLOGY ACCESS

Schools must provide 1:1 device ratios (one computing device per student) and high-speed internet access (minimum 100 Mbps) within 3 years.`,
        officialUrl: 'https://www.congress.gov/bill/119th-congress/house-bill/3245',
        representativeVotes: [] // Upcoming vote
    },
    {
        id: 'bill-us-sb1842',
        country: 'us',
        level: 'federal',
        billNumber: 'S. 1842',
        title: 'Green Energy and Climate Action Act',
        billType: 'environment',
        status: 'committee',
        introduced: 'Sen. Maria Gonzalez (D-NM)',
        voteDate: '2025-03-15',
        summary: 'Comprehensive climate legislation providing $200 billion for renewable energy infrastructure, electric vehicle charging stations, and home weatherization programs. Sets target of 70% renewable energy by 2035 and creates 2 million green jobs through workforce training programs.',
        impact: 'Would create an estimated 2 million jobs in renewable energy sectors, reduce carbon emissions by 40% by 2035, and provide weatherization assistance to 10 million low-income homes.',
        affectedPopulation: 'Benefits all Americans through cleaner air and job creation; direct assistance to 10 million households',
        fullText: `SECTION 1. RENEWABLE ENERGY INVESTMENT

(a) $200 billion shall be appropriated over 10 years for:
   - Solar and wind energy infrastructure: $80 billion
   - Electric vehicle charging network: $50 billion
   - Home and building weatherization: $40 billion
   - Workforce training programs: $30 billion

SECTION 2. RENEWABLE ENERGY TARGETS

The United States shall achieve the following renewable energy targets:
   - 2030: 50% of electricity from renewable sources
   - 2035: 70% of electricity from renewable sources
   - 2050: 100% clean energy economy

SECTION 3. GREEN JOBS TRAINING

Establish Green Jobs Training Program providing free certification and training for 2 million workers in:
   - Solar panel installation
   - Wind turbine maintenance
   - Electric vehicle technology
   - Building energy efficiency

SECTION 4. HOME WEATHERIZATION ASSISTANCE

Low-income households (under 200% federal poverty level) eligible for free home weatherization worth up to $10,000 per household.`,
        officialUrl: 'https://www.congress.gov/bill/119th-congress/senate-bill/1842',
        representativeVotes: [] // In committee
    },
    {
        id: 'bill-local-austin-cr089',
        country: 'us',
        level: 'local',
        city: 'austin_tx',
        billNumber: 'CR-2024-089',
        title: 'Affordable Housing Preservation Ordinance',
        billType: 'housing',
        status: 'passed',
        introduced: 'Council Member Vanessa Martinez (District 3)',
        voteDate: '2024-11-15',
        summary: 'Protects existing affordable housing units through rent stabilization for buildings 20+ years old, provides tax incentives for developers building affordable units, and establishes a $50 million Affordable Housing Fund. Expected to create 3,000 affordable units over 5 years.',
        impact: 'Protects 12,000 existing affordable housing units from conversion, creates 3,000 new affordable units, and provides rental assistance to 5,000 families annually.',
        affectedPopulation: 'Affects 20,000 Austin households, particularly those earning under 80% Area Median Income',
        fullText: `ORDINANCE NO. CR-2024-089

BE IT ORDAINED BY THE CITY COUNCIL OF AUSTIN, TEXAS:

SECTION 1. RENT STABILIZATION

(a) Residential buildings 20 years or older with 50+ units may not increase rent by more than 5% annually for units occupied by tenants earning below 80% Area Median Income.

(b) Landlords must provide 120 days notice of any rent increase.

SECTION 2. AFFORDABLE HOUSING FUND

City Council establishes an Affordable Housing Fund with initial funding of $50 million from general revenue and hotel occupancy tax proceeds.

SECTION 3. DEVELOPER INCENTIVES

(a) Developers building projects with 20%+ affordable units receive:
   - 50% property tax reduction for 10 years
   - Fast-track permitting
   - Fee waivers for impact and development fees

SECTION 4. EFFECTIVE DATE

This ordinance takes effect January 1, 2025.`,
        officialUrl: 'https://www.austintexas.gov/edims/document.cfm?id=409837',
        representativeVotes: [
            {
                id: 'austin-council-001',
                name: 'Vanessa Martinez',
                party: 'Non-Partisan',
                district: 'District 3',
                vote: 'yes',
                email: 'vanessa.martinez@austintexas.gov',
                phone: '+1-512-978-2103',
                billNumber: 'CR-2024-089'
            },
            {
                id: 'austin-council-002',
                name: 'Michael Chen',
                party: 'Non-Partisan',
                district: 'District 1',
                vote: 'yes',
                email: 'michael.chen@austintexas.gov',
                phone: '+1-512-978-2101',
                billNumber: 'CR-2024-089'
            },
            {
                id: 'austin-council-003',
                name: 'Robert Johnson',
                party: 'Non-Partisan',
                district: 'District 10',
                vote: 'no',
                email: 'robert.johnson@austintexas.gov',
                phone: '+1-512-978-2110',
                billNumber: 'CR-2024-089'
            }
        ]
    }
};
END OF DEMO DATA */

// Civic state
const CivicState = {
    selectedCountry: null,
    selectedState: null,
    selectedCity: null,
    searchQuery: '',
    searchType: 'representatives', // 'representatives', 'bills', 'court-decisions'
    governmentLevel: 'federal', // 'federal', 'state', 'local', 'supreme-court'
    supremeCourtLevel: 'federal', // 'federal', 'state'
    supremeCourtState: null, // Which state Supreme Court to view
    filters: {
        billType: '',
        timePeriod: 'current',
        courtTopic: '',
        voteType: '' // 'unanimous', 'split', 'narrow-split'
    },
    representatives: [],
    bills: [],
    courtDecisions: [],
    stateRepresentatives: [],
    stateBills: [],
    localOfficials: [],
    localDecisions: [],
    currentView: null
};

/**
 * Handle country selection change
 */
function handleCountryChange() {
    const select = document.getElementById('countrySelect');
    if (!select) return;
    
    CivicState.selectedCountry = select.value;
    
    if (CivicState.selectedCountry) {
        const countryName = GOVERNMENT_APIS[CivicState.selectedCountry].name;
        
        // If Supreme Court is selected, auto-refresh the dashboard
        if (CivicState.governmentLevel === 'supreme-court') {
            loadSupremeCourtDashboard();
            showNotification(`Loaded ${countryName} Supreme Court decisions`, 'success');
        } else {
            showNotification(`Selected ${countryName}. Enter a search term to begin.`, 'info');
            document.getElementById('civicSearch').focus();
        }
    }
}

/**
 * Handle government level selection change
 */
function handleGovernmentLevelChange() {
    const select = document.getElementById('governmentLevelSelect');
    if (!select) return;
    
    const previousLevel = CivicState.governmentLevel;
    CivicState.governmentLevel = select.value;
    
    const stateGroup = document.getElementById('stateSelectGroup');
    const cityGroup = document.getElementById('citySelectGroup');
    const supremeCourtLevelGroup = document.getElementById('supremeCourtLevelGroup');
    const supremeCourtStateGroup = document.getElementById('supremeCourtStateSelectGroup');
    const resultsContainer = document.getElementById('civicResults');
    
    // Check if Supreme Court is selected
    if (CivicState.governmentLevel === 'supreme-court') {
        stateGroup.style.display = 'none';
        cityGroup.style.display = 'none';
        supremeCourtLevelGroup.style.display = 'block';
        
        // Reset Supreme Court selections
        CivicState.supremeCourtLevel = 'federal';
        CivicState.supremeCourtState = null;
        document.getElementById('supremeCourtLevelSelect').value = 'federal';
        supremeCourtStateGroup.style.display = 'none';
        
        // Auto-load Federal Supreme Court dashboard
        loadSupremeCourtDashboard();
        return;
    }
    
    // Hide Supreme Court selectors when not in Supreme Court mode
    if (supremeCourtLevelGroup) supremeCourtLevelGroup.style.display = 'none';
    if (supremeCourtStateGroup) supremeCourtStateGroup.style.display = 'none';
    
    // If switching FROM Supreme Court to another level, clear the display
    if (previousLevel === 'supreme-court') {
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="results-placeholder initial-placeholder">
                    <div class="placeholder-icon">🔍</div>
                    <h3 data-translate="civic_placeholder_title">Select a country and search to begin</h3>
                    <p data-translate="civic_placeholder_text">
                        Search for representatives by name, district, or explore recent legislation.
                        Try searching for any name to see the demonstration interface.
                    </p>
                </div>
            `;
        }
    }
    
    // Show/hide state and city selectors based on government level
    if (CivicState.governmentLevel === 'state') {
        stateGroup.style.display = 'block';
        cityGroup.style.display = 'none';
        showNotification('Please select a state/province', 'info');
    } else if (CivicState.governmentLevel === 'local') {
        stateGroup.style.display = 'none';
        cityGroup.style.display = 'block';
        showNotification('Please select a city', 'info');
    } else {
        // Federal level
        stateGroup.style.display = 'none';
        cityGroup.style.display = 'none';
    }
    
    // Clear previous selections
    CivicState.selectedState = null;
    CivicState.selectedCity = null;
}

/**
 * Handle Supreme Court level change (Federal vs State)
 */
function handleSupremeCourtLevelChange() {
    const select = document.getElementById('supremeCourtLevelSelect');
    if (!select) return;
    
    CivicState.supremeCourtLevel = select.value;
    
    const supremeCourtStateGroup = document.getElementById('supremeCourtStateSelectGroup');
    
    if (CivicState.supremeCourtLevel === 'state') {
        // Show state selector and filter options by country
        supremeCourtStateGroup.style.display = 'block';
        filterStateCourtOptionsByCountry();
        showNotification('Please select a state/province Supreme Court', 'info');
    } else {
        // Hide state selector and load federal Supreme Court
        supremeCourtStateGroup.style.display = 'none';
        CivicState.supremeCourtState = null;
        loadSupremeCourtDashboard();
    }
}

/**
 * Filter state court options based on selected country
 */
function filterStateCourtOptionsByCountry() {
    const country = CivicState.selectedCountry || 'us';
    const usGroup = document.getElementById('us-states');
    const auGroup = document.getElementById('au-states');
    const caGroup = document.getElementById('ca-provinces');
    
    if (!usGroup || !auGroup || !caGroup) return;
    
    // Show only the relevant country's states/provinces
    usGroup.style.display = country === 'us' ? 'block' : 'none';
    auGroup.style.display = country === 'au' ? 'block' : 'none';
    caGroup.style.display = country === 'ca' ? 'block' : 'none';
    
    // Reset selection
    document.getElementById('supremeCourtStateSelect').value = '';
}

/**
 * Handle state Supreme Court selection change
 */
function handleSupremeCourtStateChange() {
    const select = document.getElementById('supremeCourtStateSelect');
    if (!select) return;
    
    CivicState.supremeCourtState = select.value;
    
    if (CivicState.supremeCourtState) {
        // Auto-load selected state Supreme Court dashboard
        loadSupremeCourtDashboard();
    }
}

/**
 * Handle state selection change
 */
function handleStateChange() {
    const select = document.getElementById('stateSelect');
    if (!select) return;
    
    CivicState.selectedState = select.value;
    
    if (CivicState.selectedState) {
        // Auto-trigger search when state changes
        searchCivicData();
    }
}

/**
 * Handle city selection change
 */
function handleCityChange() {
    const select = document.getElementById('citySelect');
    if (!select) return;
    
    CivicState.selectedCity = select.value;
    
    if (CivicState.selectedCity) {
        // Auto-trigger search when city changes
        searchCivicData();
    }
}

/**
 * Search civic data
 */
async function searchCivicData() {
    const searchInput = document.getElementById('civicSearch');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    
    if (!CivicState.selectedCountry) {
        showNotification('Please select a country first', 'error');
        return;
    }
    
    if (!query) {
        showNotification('Please enter a search term', 'error');
        return;
    }
    
    CivicState.searchQuery = query;
    
    showLoading();
    
    try {
        // Search for representatives and bills
        const results = await performCivicSearch(CivicState.selectedCountry, query);
        displayCivicResults(results);
        hideLoading();
    } catch (error) {
        console.error('Search error:', error);
        hideLoading();
        showNotification('😊 Oops! We couldn\'t search right now. Please try again in a moment. 💙', 'error');
    }
}

/**
 * Perform civic search based on country
 */
async function performCivicSearch(country, query) {
    // Since we can't actually call government APIs directly from browser,
    // we'll create a demonstration with sample data
    // In production, this would proxy through a backend or use CORS-enabled APIs
    
    return generateSampleCivicData(country, query);
}

/**
 * Generate sample civic data for demonstration
 */
function generateSampleCivicData(country, query) {
    const countryName = GOVERNMENT_APIS[country].name;
    
    // Create a more realistic representative name based on query
    const queryName = query.trim();
    const displayName = queryName || 'Sample Representative';
    
    // Sample representatives
    const representatives = [
        {
            id: '1',
            name: displayName,
            party: 'Democratic Party',
            district: 'District 5',
            state: countryName === 'United States' ? 'Texas' : countryName,
            photo: 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=' + displayName.charAt(0).toUpperCase(),
            email: `${queryName.toLowerCase().replace(/\s+/g, '.')}@example.gov`,
            phone: '+1-202-555-0100',
            website: 'https://example.gov',
            votingRecord: {
                education: 85,
                health: 92,
                environment: 78,
                economy: 65,
                civilRights: 95,
                labor: 88
            },
            recentVotes: [
                {
                    id: 'bill1',
                    billName: 'Education Funding Act 2024',
                    date: '2024-12-15',
                    vote: 'yes',
                    summary: 'Increases funding for public schools and teacher salaries by 15%',
                    billUrl: 'https://example.gov/bills/education-funding-2024'
                },
                {
                    id: 'bill2',
                    billName: 'Universal Healthcare Expansion',
                    date: '2024-12-10',
                    vote: 'yes',
                    summary: 'Expands healthcare coverage to include dental and vision care',
                    billUrl: 'https://example.gov/bills/healthcare-expansion'
                },
                {
                    id: 'bill3',
                    billName: 'Climate Action Initiative',
                    date: '2024-12-05',
                    vote: 'yes',
                    summary: 'Invests in renewable energy and reduces carbon emissions',
                    billUrl: 'https://example.gov/bills/climate-action'
                },
                {
                    id: 'bill4',
                    billName: 'Worker Rights Protection Act',
                    date: '2024-11-28',
                    vote: 'yes',
                    summary: 'Strengthens collective bargaining rights and workplace safety standards',
                    billUrl: 'https://example.gov/bills/worker-rights'
                },
                {
                    id: 'bill5',
                    billName: 'Corporate Tax Reform',
                    date: '2024-11-20',
                    vote: 'no',
                    summary: 'Reduces corporate tax rates for large businesses',
                    billUrl: 'https://example.gov/bills/corporate-tax-reform'
                }
            ]
        }
    ];
    
    // Get court decisions for this country
    const courtDecisions = SAMPLE_COURT_DECISIONS[country] || [];
    
    return {
        representatives,
        courtDecisions,
        count: representatives.length + courtDecisions.length,
        query
    };
}

/**
 * Display civic search results
 */
function displayCivicResults(results) {
    const resultsContainer = document.getElementById('civicResults');
    if (!resultsContainer) return;
    
    const hasResults = (results.representatives && results.representatives.length > 0) || 
                       (results.courtDecisions && results.courtDecisions.length > 0);
    
    if (!hasResults) {
        resultsContainer.innerHTML = `
            <div class="results-placeholder">
                <div class="placeholder-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try a different search term or check your spelling.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="demo-badge" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <i class="fas fa-flask"></i> <strong>DEMONSTRATION DATA</strong> - This is sample data showing the interface design. Real API integration requires a backend server.
        </div>`;
    
    // Display representatives if any
    if (results.representatives && results.representatives.length > 0) {
        html += `<div class="civic-results-list">`;
        results.representatives.forEach(rep => {
            html += createRepresentativeCard(rep);
        });
        html += `</div>`;
    }
    
    // Display court decisions if any
    if (results.courtDecisions && results.courtDecisions.length > 0) {
        html += `
            <div class="court-decisions-section">
                <h3 style="margin: 30px 0 20px 0; font-size: 1.5rem; color: var(--primary);">
                    <i class="fas fa-gavel"></i> Supreme Court Decisions
                </h3>
                <div class="court-decisions-list">`;
        
        results.courtDecisions.forEach(decision => {
            html += createCourtDecisionCard(decision);
        });
        
        html += `</div></div>`;
    }
    
    resultsContainer.innerHTML = html;
    
    // Create charts after DOM is updated
    setTimeout(() => {
        if (results.representatives) {
            results.representatives.forEach(rep => {
                if (typeof createVotingPatternChart === 'function') {
                    createVotingPatternChart(rep.id, rep.votingRecord);
                }
            });
        }
    }, 100);
}

/**
 * Create representative card HTML
 */
function createRepresentativeCard(rep) {
    const voteClass = (vote) => vote === 'yes' ? 'vote-yes' : 'vote-no';
    const voteIcon = (vote) => vote === 'yes' ? '✓' : '✗';
    
    return `
        <div class="representative-card">
            <div class="rep-header">
                <img src="${rep.photo}" alt="${rep.name}" class="rep-photo">
                <div class="rep-basic-info">
                    <h3>${rep.name}</h3>
                    <p class="rep-party">${rep.party}</p>
                    <p class="rep-district">${rep.district}, ${rep.state}</p>
                    <div class="rep-contact">
                        <a href="mailto:${rep.email}" class="contact-link" title="Email">
                            <i class="fas fa-envelope"></i>
                        </a>
                        <a href="tel:${rep.phone}" class="contact-link" title="Phone">
                            <i class="fas fa-phone"></i>
                        </a>
                        <a href="${rep.website}" target="_blank" rel="noopener noreferrer" class="contact-link" title="Website">
                            <i class="fas fa-globe"></i>
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="voting-analysis">
                <h4>Voting Pattern Analysis</h4>
                <div class="voting-chart" style="height: 300px;">
                    <canvas id="chart-${rep.id}"></canvas>
                </div>
                
                <div class="topic-breakdown">
                    <h5>Support by Issue Area</h5>
                    ${Object.entries(rep.votingRecord).map(([topic, percentage]) => `
                        <div class="topic-bar">
                            <div class="topic-label">
                                ${getTopicIcon(topic)} ${formatTopicName(topic)}
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%; background: ${getTopicColor(percentage)}"></div>
                            </div>
                            <div class="topic-percentage">${percentage}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="recent-votes">
                <h4>Recent Key Votes</h4>
                ${rep.recentVotes.map(vote => `
                    <div class="vote-item">
                        <div class="vote-header-row">
                            <span class="bill-name">${vote.billName}</span>
                            <span class="vote-position ${voteClass(vote.vote)}">
                                ${voteIcon(vote.vote)} ${vote.vote === 'yes' ? 'Supported' : 'Opposed'}
                            </span>
                        </div>
                        <p class="vote-date">${formatDate(vote.date)}</p>
                        <p class="bill-summary">${vote.summary}</p>
                        <div class="vote-actions">
                            <a href="${vote.billUrl}" class="btn-link" target="_blank" rel="noopener noreferrer">
                                View Official Bill <i class="fas fa-external-link-alt"></i>
                            </a>
                            <button class="btn-link" onclick="analyzeBillImpact('${vote.id}', '${rep.id}')">
                                Analyze Impact <i class="fas fa-chart-line"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Create court decision card HTML
 */
function createCourtDecisionCard(decision) {
    console.log('📝 createCourtDecisionCard called with:', decision.id, decision.caseName);
    
    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    
    const escapeQuotes = (str) => {
        if (!str) return '';
        return String(str).replace(/'/g, '&apos;');
    };
    
    const formatDecisionDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const voteDisplay = `${decision.voteCount.majority}-${decision.voteCount.dissent}`;
    const isNarrow = (decision.voteCount.majority - decision.voteCount.dissent) <= 1;
    
    return `
        <div class="court-decision-card" data-decision-id="${decision.id}">
            <div class="decision-header">
                <div class="decision-title-row">
                    <h3 class="decision-title">
                        <i class="fas fa-gavel"></i>
                        ${escapeHtml(decision.caseName)}
                    </h3>
                    <div class="decision-vote ${isNarrow ? 'narrow-vote' : ''}">
                        ${voteDisplay}
                    </div>
                </div>
                <div class="decision-meta">
                    <span class="decision-court">${escapeHtml(decision.courtName)}</span>
                    <span class="decision-separator">•</span>
                    <span class="decision-docket">Docket: ${escapeHtml(decision.docketNumber)}</span>
                    <span class="decision-separator">•</span>
                    <span class="decision-date">${formatDecisionDate(decision.decisionDate)}</span>
                </div>
                <div class="decision-topic">
                    ${getTopicIcon(decision.topic)} ${formatTopicName(decision.topic)}
                </div>
            </div>
            
            <!-- Citizen Impact (Most Important - Show First) -->
            <div class="decision-section citizen-impact-section">
                <div class="section-header" onclick="toggleDecisionSection('impact-${decision.id}')">
                    <h4><i class="fas fa-users"></i> How This Affects You</h4>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="section-content active" id="impact-${decision.id}" onclick="closeDecisionSection('impact-${decision.id}')" style="cursor: pointer;" title="Click anywhere to close">
                    <div class="impact-summary">
                        ${escapeHtml(decision.citizenImpact.shortSummary)}
                    </div>
                    
                    <div class="affected-groups">
                        <strong>Affected Groups:</strong>
                        ${decision.citizenImpact.affectedGroups.map(group => 
                            `<span class="group-badge">${escapeHtml(group)}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="real-world-effects">
                        <strong>Real-World Effects:</strong>
                        <ul>
                            ${decision.citizenImpact.realWorldEffects.map(effect => 
                                `<li>${escapeHtml(effect)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div class="impact-timeline">
                        <div class="timeline-item">
                            <strong>Immediate Changes:</strong>
                            <p>${escapeHtml(decision.citizenImpact.immediateChanges)}</p>
                        </div>
                        <div class="timeline-item">
                            <strong>Long-Term Implications:</strong>
                            <p>${escapeHtml(decision.citizenImpact.longTermImplications)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Majority Opinion -->
            <div class="decision-section majority-section">
                <div class="section-header" onclick="toggleDecisionSection('majority-${decision.id}')">
                    <h4><i class="fas fa-check-circle"></i> Majority Opinion (${decision.voteCount.majority} Justices)</h4>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="section-content" id="majority-${decision.id}" onclick="closeDecisionSection('majority-${decision.id}')" style="cursor: pointer;" title="Click anywhere to close">
                    <div class="opinion-author">
                        <strong>Opinion by:</strong> ${escapeHtml(decision.majorityOpinion.author)}
                    </div>
                    <div class="opinion-summary">
                        ${escapeHtml(decision.majorityOpinion.summary)}
                    </div>
                    <div class="key-points">
                        <strong>Key Points:</strong>
                        <ul>
                            ${decision.majorityOpinion.keyPoints.map(point => 
                                `<li>${escapeHtml(point)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="legal-reasoning">
                        <strong>Legal Reasoning:</strong>
                        <p>${escapeHtml(decision.majorityOpinion.legalReasoning)}</p>
                    </div>
                </div>
            </div>
            
            <!-- Dissenting Opinion -->
            <div class="decision-section dissent-section">
                <div class="section-header" onclick="toggleDecisionSection('dissent-${decision.id}')">
                    <h4><i class="fas fa-times-circle"></i> Dissenting Opinion (${decision.voteCount.dissent} Justices)</h4>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="section-content" id="dissent-${decision.id}" onclick="closeDecisionSection('dissent-${decision.id}')" style="cursor: pointer;" title="Click anywhere to close">
                    <div class="opinion-author">
                        <strong>Dissent by:</strong> ${decision.dissentingOpinion.authors.join(', ')}
                    </div>
                    <div class="opinion-summary">
                        ${escapeHtml(decision.dissentingOpinion.summary)}
                    </div>
                    <div class="key-points">
                        <strong>Key Arguments:</strong>
                        <ul>
                            ${decision.dissentingOpinion.keyPoints.map(point => 
                                `<li>${escapeHtml(point)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="dissent-concerns">
                        <strong>Concerns Raised:</strong>
                        <p>${escapeHtml(decision.dissentingOpinion.concerns)}</p>
                    </div>
                </div>
            </div>
            
            <!-- Deliberation Summary -->
            <div class="decision-section deliberation-section">
                <div class="section-header" onclick="toggleDecisionSection('deliberation-${decision.id}')">
                    <h4><i class="fas fa-comments"></i> Deliberation Highlights</h4>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="section-content" id="deliberation-${decision.id}" onclick="closeDecisionSection('deliberation-${decision.id}')" style="cursor: pointer;" title="Click anywhere to close">
                    <div class="main-questions">
                        <strong>Main Questions Addressed:</strong>
                        <ul>
                            ${decision.deliberation.mainQuestions.map(q => 
                                `<li>${escapeHtml(q)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="key-debates">
                        <strong>Key Debates:</strong>
                        <p>${escapeHtml(decision.deliberation.keyDebates)}</p>
                    </div>
                </div>
            </div>
            
            <!-- Take Action (Contact to Support/Oppose) -->
            ${decision.citizenContact ? `
                <div class="decision-section take-action-section">
                    <div class="section-header" onclick="toggleDecisionSection('contact-${decision.id}')">
                        <h4><i class="fas fa-bullhorn"></i> Take Action: Make Your Voice Heard</h4>
                        <i class="fas fa-chevron-down toggle-icon"></i>
                    </div>
                    <div class="section-content" id="contact-${decision.id}" onclick="closeDecisionSection('contact-${decision.id}')" style="cursor: pointer;" title="Click anywhere to close">
                        <div class="action-intro">
                            <p>${escapeHtml(decision.citizenContact.intro)}</p>
                        </div>
                        
                        <div class="contact-methods">
                            ${decision.citizenContact.email ? `
                                <div class="contact-method">
                                    <i class="fas fa-envelope"></i>
                                    <div class="contact-details">
                                        <strong>Email:</strong>
                                        <a href="mailto:${decision.citizenContact.email}">${decision.citizenContact.email}</a>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${decision.citizenContact.phone ? `
                                <div class="contact-method">
                                    <i class="fas fa-phone"></i>
                                    <div class="contact-details">
                                        <strong>Phone:</strong>
                                        <a href="tel:${decision.citizenContact.phone}">${decision.citizenContact.phone}</a>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${decision.citizenContact.website ? `
                                <div class="contact-method">
                                    <i class="fas fa-globe"></i>
                                    <div class="contact-details">
                                        <strong>Website:</strong>
                                        <a href="${decision.citizenContact.website}" target="_blank" rel="noopener noreferrer">Submit Public Comment</a>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${decision.citizenContact.mailingAddress ? `
                                <div class="contact-method">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div class="contact-details">
                                        <strong>Mailing Address:</strong>
                                        <address style="font-style: normal;">${escapeHtml(decision.citizenContact.mailingAddress)}</address>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${decision.citizenContact.tips ? `
                            <div class="contact-tips">
                                <strong>Tips for Effective Communication:</strong>
                                <ul>
                                    ${decision.citizenContact.tips.map(tip => 
                                        `<li>${escapeHtml(tip)}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            <!-- Actions -->
            <div class="decision-actions">
                <a href="${decision.fullOpinionUrl}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-file-pdf"></i> Read Full Opinion
                </a>
                <button class="btn btn-primary" onclick="askAssistantAboutDecision('${escapeQuotes(decision.id)}', '${escapeQuotes(decision.caseName)}')">
                    <i class="fas fa-comment-dots"></i> Ask Assistant About This Decision
                </button>
            </div>
            
            ${decision.relatedCases && decision.relatedCases.length > 0 ? `
                <div class="related-cases">
                    <strong>Related Cases:</strong>
                    ${decision.relatedCases.map(c => `<span class="related-case">${escapeHtml(c)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Toggle decision section expand/collapse
 */
function toggleDecisionSection(sectionId) {
    const content = document.getElementById(sectionId);
    const header = content.previousElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('active');
        icon.style.transform = 'rotate(180deg)';
    }
}

/**
 * Close decision section (for click-anywhere-to-close functionality)
 */
function closeDecisionSection(sectionId) {
    const content = document.getElementById(sectionId);
    const header = content.previousElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        icon.style.transform = 'rotate(0deg)';
    }
}

/**
 * Ask about a specific court decision (using built-in explanations - no AI costs)
 */
function askAssistantAboutDecision(decisionId, caseName) {
    // Open the chat widget
    const chatWindow = document.getElementById('civicChatWindow');
    if (chatWindow && !chatWindow.classList.contains('active')) {
        toggleCivicChat();
    }
    
    // Pre-fill the chat input
    const chatInput = document.getElementById('civicChatInput');
    if (chatInput) {
        chatInput.value = `Tell me about the ${caseName} decision`;
        chatInput.focus();
    }
    
    // Add user message
    addChatMessage('user', `Tell me about the ${caseName} decision`, 'civic');
    
    // Generate response using built-in data (no AI costs)
    setTimeout(() => {
        const response = generateCourtDecisionChatResponse(decisionId, caseName);
        addChatMessage('assistant', response, 'civic');
    }, 500);
}

/**
 * Find decision by ID across all courts
 */
function findDecisionById(decisionId) {
    // Check federal Supreme Courts
    for (const country in SAMPLE_COURT_DECISIONS) {
        const found = SAMPLE_COURT_DECISIONS[country].find(d => d.id === decisionId);
        if (found) return found;
    }
    
    // Check state Supreme Courts
    for (const country in STATE_SUPREME_COURT_DECISIONS) {
        for (const state in STATE_SUPREME_COURT_DECISIONS[country]) {
            const found = STATE_SUPREME_COURT_DECISIONS[country][state].find(d => d.id === decisionId);
            if (found) return found;
        }
    }
    
    return null;
}

/**
 * Generate chat response about court decision
 */
function generateCourtDecisionChatResponse(decisionId, caseName) {
    // Find the decision in our data
    let decision = null;
    for (const country in SAMPLE_COURT_DECISIONS) {
        const found = SAMPLE_COURT_DECISIONS[country].find(d => d.id === decisionId);
        if (found) {
            decision = found;
            break;
        }
    }
    
    if (!decision) {
        return `I apologize, but I don't have information about that specific decision. However, I can answer general questions about Supreme Court decisions and their impact!`;
    }
    
    return `📚 **${caseName}**\n\n` +
           `**The Decision:** The court voted ${decision.voteCount.majority}-${decision.voteCount.dissent} on ${new Date(decision.decisionDate).toLocaleDateString()}. ${decision.majorityOpinion.summary}\n\n` +
           `**How It Affects You:** ${decision.citizenImpact.shortSummary}\n\n` +
           `**The Dissent:** ${decision.dissentingOpinion.summary}\n\n` +
           `💬 You can ask me:\n` +
           `• "What were the dissenting arguments?"\n` +
           `• "How does this affect [specific group]?"\n` +
           `• "What are the long-term implications?"\n` +
           `• "Compare this to previous decisions"`;
}

/**
 * Apply civic filters
 */
function applyCivicFilters() {
    const billType = document.getElementById('billTypeFilter').value;
    const timePeriod = document.getElementById('timePeriodFilter').value;
    
    CivicState.filters.billType = billType;
    CivicState.filters.timePeriod = timePeriod;
    
    showNotification('Filters applied', 'success');
    
    // Re-search with filters
    if (CivicState.searchQuery) {
        searchCivicData();
    }
}

/**
 * DEPRECATED: Old chat functions removed in V32.9.4
 * Chat functionality now in civic-chat.js with Jobs-style pattern
 * Keeping askAssistantAboutDecision() for backward compatibility
 */

/**
 * Ask about a specific court decision (pre-fills new standardized chat)
 */
function askAssistantAboutDecision(decisionId, caseName) {
    // Open the new chat widget
    const chatWindow = document.getElementById('civicChatWindowTop');
    if (chatWindow && !chatWindow.classList.contains('active')) {
        toggleCivicChatTop();
    }
    
    // Pre-fill the chat input
    const chatInput = document.getElementById('civicChatInputTop');
    if (chatInput) {
        chatInput.value = `Tell me about the ${caseName} decision`;
        chatInput.focus();
    }
}

/**
 * Generate civic chat response (kept for backward compatibility)
 */
function generateCivicChatResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    const demoPrefix = '📝 **Demo Response:** ';
    
    // Supreme Court / Court Decision questions
    if (lowerMessage.includes('supreme court') || lowerMessage.includes('court decision') || 
        lowerMessage.includes('ruling') || lowerMessage.includes('justice')) {
        return demoPrefix + 'I can help you understand Supreme Court decisions! Search for a representative above to see related court decisions, or ask me specific questions like:\n\n' +
               '• "Tell me about recent labor rights decisions"\n' +
               '• "How does [case name] affect workers?"\n' +
               '• "What did the dissenting justices say?"\n' +
               '• "Explain the majority opinion"\n\n' +
               'Each decision includes summaries of majority and dissenting opinions, deliberation highlights, and most importantly - **how it affects you as a citizen**. (Demo mode active)';
    } else if (lowerMessage.includes('workers united') || lowerMessage.includes('dissent') || 
               lowerMessage.includes('majority opinion')) {
        return demoPrefix + 'The **Workers United v. Corporate Industries** case (6-3 decision) strengthened workers\' rights to organize and bargain collectively. \n\n' +
               '**Key Points:**\n' +
               '• Workers cannot be retaliated against for organizing\n' +
               '• Employers must engage in good-faith bargaining\n' +
               '• Union formation is constitutionally protected\n\n' +
               '**The Dissent** (3 justices) argued this could burden small businesses and questioned the constitutional basis.\n\n' +
               '**For You:** This means stronger protection if you want to form or join a union at your workplace! (Demo data)';
    } else if (lowerMessage.includes('environmental') || lowerMessage.includes('climate') || 
               lowerMessage.includes('epa')) {
        return demoPrefix + 'The **Environmental Coalition v. Department of Energy** case (5-4 decision) affirmed EPA\'s authority to regulate greenhouse gases under the Clean Air Act.\n\n' +
               '**Impact on You:**\n' +
               '• Cleaner air in your community\n' +
               '• Faster transition to renewable energy\n' +
               '• Potential short-term energy cost increases\n' +
               '• Long-term climate change mitigation\n\n' +
               'The dissent worried about agency overreach and economic impacts. Want to know more about specific aspects? (Demo data)';
    } else if (lowerMessage.includes('how does') && (lowerMessage.includes('affect') || lowerMessage.includes('impact'))) {
        return demoPrefix + 'Great question! Every Supreme Court decision I show includes a detailed **"How This Affects You"** section that explains:\n\n' +
               '• **Who is affected** - Which groups and communities\n' +
               '• **Real-world effects** - Concrete changes in daily life\n' +
               '• **Immediate changes** - What happens right away\n' +
               '• **Long-term implications** - How society might change over time\n\n' +
               'I translate legal jargon into plain language so you can understand what these decisions mean for your life! (Demo mode)';
    } else if (lowerMessage.includes('ted cruz') || lowerMessage.includes('cruz')) {
        return demoPrefix + 'To view Ted Cruz\'s voting record, search for "Ted Cruz" in the search box above after selecting "United States" as the country. The demonstration will show you how the interface displays voting patterns, recent bills, and contact information. Note: This is sample data for demonstration purposes only.';
    } else if (lowerMessage.includes('voting record') || lowerMessage.includes('how did') || lowerMessage.includes('vote')) {
        return demoPrefix + 'To view a representative\'s voting record, search for them by name above. You\'ll see their complete voting history organized by topic area, including education, healthcare, environment, and more. Each vote includes the bill details and links to official government sources. (Demo mode: Currently showing sample data)';
    } else if (lowerMessage.includes('bill') || lowerMessage.includes('legislation')) {
        return demoPrefix + 'You can search for specific bills by entering the bill name or number. Each bill listing includes a plain-language summary, the date of the vote, and links to the official government documentation where you can read the full text. (Demo mode: Sample bills shown)';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
        return demoPrefix + 'Every representative profile includes their contact information - email, phone, and website. You can reach out to them directly to share your views on legislation or ask questions about their positions. (Demo mode: Sample contact info shown)';
    } else if (lowerMessage.includes('compare')) {
        return demoPrefix + 'To compare representatives, search for multiple names and view their voting records side by side. You can see how they differ on key issues like education, healthcare, environment, and civil rights. (Demo mode active)';
    } else if (lowerMessage.includes('real') || lowerMessage.includes('actual') || lowerMessage.includes('demo')) {
        return '⚠️ This module is currently in **demonstration mode** because static websites cannot directly connect to government APIs. Real implementation would require:\n\n1. Backend server to proxy API requests\n2. API keys for congress.gov, ProPublica, court APIs, etc.\n3. Database to cache and process government data\n\nThe interface and features are fully designed - only the data source needs backend infrastructure. This includes Supreme Court decisions, representative voting records, and bill tracking.';
    } else {
        return demoPrefix + 'I can help you with:\n\n' +
               '**📊 Representatives:** Voting records, contact info, bill positions\n' +
               '**⚖️ Supreme Court:** Decision summaries, citizen impact, dissenting opinions\n' +
               '**📜 Legislation:** Bill details, impact analysis, voting history\n\n' +
               'Try asking about a specific representative, court case, or policy area! (Note: Currently in demo mode with sample responses)';
    }
}

/**
 * Analyze bill impact
 */
function analyzeBillImpact(billId, repId) {
    const content = `
        <div style="max-width: 800px; padding: 0; background: transparent;">
            <h2 style="color: white; text-align: center; margin-bottom: var(--space-xl);">Bill Impact Analysis</h2>
            <div style="text-align: right; margin-bottom: 20px;">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
            </div>
            
            <h3 style="color: #FFD700; margin-bottom: var(--space-lg);">📜 Education Funding Act 2024</h3>
            
            <div style="background: linear-gradient(135deg, rgba(74,59,46,0.5) 0%, rgba(61,47,36,0.5) 100%); padding: var(--space-xl); border-radius: var(--radius-md); margin: var(--space-lg) 0; border: 2px solid rgba(107,85,68,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
                <h4 style="color: #FFD700; margin-bottom: var(--space-md);">Quick Summary</h4>
                <p style="color: white;">This bill proposes a 15% increase in federal funding for public schools, with specific allocations for teacher salary increases and classroom resources.</p>
            </div>
            
            <h4 style="color: #FFD700; margin-top: var(--space-xl); margin-bottom: var(--space-md);">✅ Who Benefits?</h4>
            <ul style="color: white;">
                <li><strong style="color: white;">Teachers:</strong> Average salary increase of $5,000-$8,000</li>
                <li><strong style="color: white;">Students:</strong> Smaller class sizes and better resources</li>
                <li><strong style="color: white;">Schools:</strong> Updated technology and facility improvements</li>
                <li><strong style="color: white;">Communities:</strong> Better educational outcomes and economic growth</li>
            </ul>
            
            <h4 style="color: #FFD700; margin-top: var(--space-xl); margin-bottom: var(--space-md);">⚠️ Potential Concerns</h4>
            <ul style="color: white;">
                <li><strong style="color: white;">Funding Source:</strong> Requires $50 billion in new federal spending</li>
                <li><strong style="color: white;">Distribution:</strong> Allocation formula may favor some regions over others</li>
                <li><strong style="color: white;">Implementation:</strong> Timeline spans 5 years for full rollout</li>
            </ul>
            
            <h4 style="color: #FFD700; margin-top: var(--space-xl); margin-bottom: var(--space-md);">💰 Economic Impact</h4>
            <p style="color: white;">Independent analysis estimates:</p>
            <ul style="color: white;">
                <li>Creation of 75,000 new teaching positions</li>
                <li>$2.4 billion in economic activity from construction projects</li>
                <li>Long-term GDP growth of 0.3% from improved education outcomes</li>
            </ul>
            
            <h4 style="color: #FFD700; margin-top: var(--space-xl); margin-bottom: var(--space-md);">🔮 What Happens Next?</h4>
            <p style="color: white;">This bill has passed the House and is currently in Senate committee. Contact your Senator to share your views.</p>
            
            <div style="margin-top: 30px; text-align: center;">
                <a href="https://example.gov/bills/education-funding-2024" target="_blank" class="btn btn-primary">
                    View Full Bill Text <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `;
    openModal(content);
}

/**
 * Utility functions
 */
function getTopicIcon(topic) {
    const icons = {
        education: '📚',
        health: '🏥',
        environment: '🌍',
        economy: '💰',
        civilRights: '⚖️',
        labor: '💼'
    };
    return icons[topic] || '📋';
}

function formatTopicName(topic) {
    return topic
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function getTopicColor(percentage) {
    if (percentage >= 80) return 'var(--success)';
    if (percentage >= 60) return 'var(--info)';
    if (percentage >= 40) return 'var(--warning)';
    return 'var(--error)';
}

// Add civic-specific styles
// Create styles (will be applied when DOM is ready)
// Inline styles removed - now using external CSS in main.css
// All civic transparency styles are in css/main.css for better maintainability

// Make functions and data globally available IMMEDIATELY (no DOM dependencies)
window.GOVERNMENT_APIS = GOVERNMENT_APIS;
window.SAMPLE_COURT_DECISIONS = SAMPLE_COURT_DECISIONS;
window.STATE_SUPREME_COURT_DECISIONS = STATE_SUPREME_COURT_DECISIONS;
window.SAMPLE_BILLS = SAMPLE_BILLS;
window.handleCountryChange = handleCountryChange;
window.handleGovernmentLevelChange = handleGovernmentLevelChange;
// V36.5.3: Only export functions that exist
if (typeof handleStateChange !== 'undefined') window.handleStateChange = handleStateChange;
if (typeof handleCityChange !== 'undefined') window.handleCityChange = handleCityChange;
if (typeof searchCivicData !== 'undefined') window.searchCivicData = searchCivicData;
if (typeof applyCivicFilters !== 'undefined') window.applyCivicFilters = applyCivicFilters;
// toggleCivicChat removed - function doesn't exist
// sendCivicMessage removed - function doesn't exist  
if (typeof analyzeBillImpact !== 'undefined') window.analyzeBillImpact = analyzeBillImpact;
if (typeof toggleDecisionSection !== 'undefined') window.toggleDecisionSection = toggleDecisionSection;
if (typeof closeDecisionSection !== 'undefined') window.closeDecisionSection = closeDecisionSection;
if (typeof askAssistantAboutDecision !== 'undefined') window.askAssistantAboutDecision = askAssistantAboutDecision;
window.createCourtDecisionCard = createCourtDecisionCard;
window.generateSampleCivicData = generateSampleCivicData;
window.displayCivicResults = displayCivicResults;
window.loadSupremeCourtDashboard = loadSupremeCourtDashboard;
window.displaySupremeCourtDashboard = displaySupremeCourtDashboard;
window.filterSupremeCourtByCategory = filterSupremeCourtByCategory;
window.handleSupremeCourtLevelChange = handleSupremeCourtLevelChange;
window.handleSupremeCourtStateChange = handleSupremeCourtStateChange;
window.filterStateCourtOptionsByCountry = filterStateCourtOptionsByCountry;
window.findDecisionById = findDecisionById;

/**
 * Load Supreme Court Dashboard with categorized cases and analytics
 */
function loadSupremeCourtDashboard() {
    const country = CivicState.selectedCountry || 'us';
    let cases = [];
    let courtName = '';
    let isStateCourt = false;
    
    // Check if viewing federal or state Supreme Court
    if (CivicState.supremeCourtLevel === 'state') {
        // State Supreme Court
        if (!CivicState.supremeCourtState) {
            showNotification('Please select a state Supreme Court', 'info');
            return;
        }
        
        const stateData = STATE_SUPREME_COURT_DECISIONS[country]?.[CivicState.supremeCourtState];
        if (!stateData || stateData.length === 0) {
            showNotification(`No state Supreme Court decisions available for this selection`, 'info');
            return;
        }
        
        cases = stateData;
        courtName = cases[0]?.courtName || 'State Supreme Court';
        isStateCourt = true;
    } else {
        // Federal Supreme Court
        cases = SAMPLE_COURT_DECISIONS[country] || [];
        
        if (cases.length === 0) {
            showNotification(`No Supreme Court decisions available for ${GOVERNMENT_APIS[country]?.name || 'this country'}`, 'info');
            return;
        }
        
        courtName = cases[0]?.courtName || 'Supreme Court';
    }
    
    displaySupremeCourtDashboard(cases, country, courtName, isStateCourt);
}

/**
 * Display Supreme Court Dashboard with categorized cases and analytics
 */
function displaySupremeCourtDashboard(cases, country, courtName, isStateCourt = false) {
    const resultsContainer = document.getElementById('civicResults');
    if (!resultsContainer) return;
    
    const countryName = GOVERNMENT_APIS[country]?.name || 'Country';
    const displayName = isStateCourt ? courtName : `${countryName} Supreme Court`;
    
    // Categorize cases by topic
    const categorized = {
        labor: [],
        environment: [],
        'civil-rights': [],
        healthcare: [],
        economy: [],
        technology: [],
        other: []
    };
    
    cases.forEach(c => {
        const topic = c.topic || 'other';
        if (categorized[topic]) {
            categorized[topic].push(c);
        } else {
            categorized.other.push(c);
        }
    });
    
    // Calculate analytics
    const analytics = calculateSupremeCourtAnalytics(cases);
    
    let html = `
        <div class="supreme-court-dashboard">
            <div class="dashboard-header">
                <h2 style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                    <span style="font-size: 2rem;">⚖️</span>
                    <span>${displayName} Dashboard</span>
                </h2>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">
                    Recent decisions analyzed with voting patterns and trend insights
                </p>
            </div>
            
            <!-- Analytics Overview -->
            <div class="analytics-overview" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
                <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="font-size: 2.5rem; font-weight: bold;">${analytics.totalCases}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Total Decisions</div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="font-size: 2.5rem; font-weight: bold;">${analytics.avgMargin.toFixed(1)}%</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Avg Vote Margin</div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="font-size: 2.5rem; font-weight: bold;">${analytics.unanimousCases}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Unanimous Decisions</div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="font-size: 2.5rem; font-weight: bold;">${analytics.mostCommonTopic}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">Top Topic</div>
                </div>
            </div>
            
            <!-- Voting Pattern Chart -->
            <div class="chart-section" style="background: var(--surface); padding: 25px; border-radius: 12px; margin: 30px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <span>📊</span>
                    <span>Decision Breakdown</span>
                </h3>
                <canvas id="votingPatternChart" style="max-height: 300px;"></canvas>
            </div>
            
            <!-- Category Filter Tabs -->
            <div class="category-tabs" style="display: flex; gap: 10px; flex-wrap: wrap; margin: 30px 0;">
                <button onclick="filterSupremeCourtByCategory('all')" class="category-tab active" data-category="all" style="padding: 12px 20px; border: 2px solid var(--primary); background: var(--primary); color: white; border-radius: 25px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    All Cases (${cases.length})
                </button>
                ${Object.keys(categorized).map(cat => {
                    if (categorized[cat].length === 0) return '';
                    const icon = getTopicIcon(cat);
                    const name = formatTopicName(cat);
                    return `
                        <button onclick="filterSupremeCourtByCategory('${cat}')" class="category-tab" data-category="${cat}" style="padding: 12px 20px; border: 2px solid var(--primary); background: transparent; color: var(--primary); border-radius: 25px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                            ${icon} ${name} (${categorized[cat].length})
                        </button>
                    `;
                }).join('')}
            </div>
            
            <!-- Cases Display -->
            <div class="supreme-court-cases" id="supremeCourtCasesContainer">
    `;
    
    // Display all cases initially
    cases.forEach(c => {
        html += createCourtDecisionCard(c);
    });
    
    html += `
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    
    // Render chart after DOM update
    setTimeout(() => {
        renderVotingPatternChart(analytics);
    }, 100);
}

/**
 * Calculate analytics from Supreme Court cases
 */
function calculateSupremeCourtAnalytics(cases) {
    const totalCases = cases.length;
    let totalMargin = 0;
    let unanimousCases = 0;
    const topicCount = {};
    const voteDistribution = {};
    
    cases.forEach(c => {
        const total = c.voteCount.majority + c.voteCount.dissent;
        const margin = ((c.voteCount.majority - c.voteCount.dissent) / total) * 100;
        totalMargin += Math.abs(margin);
        
        if (c.voteCount.dissent === 0) {
            unanimousCases++;
        }
        
        const topic = c.topic || 'other';
        topicCount[topic] = (topicCount[topic] || 0) + 1;
        
        const voteKey = `${c.voteCount.majority}-${c.voteCount.dissent}`;
        voteDistribution[voteKey] = (voteDistribution[voteKey] || 0) + 1;
    });
    
    const avgMargin = totalMargin / totalCases;
    const mostCommonTopic = Object.keys(topicCount).reduce((a, b) => 
        topicCount[a] > topicCount[b] ? a : b
    );
    
    return {
        totalCases,
        avgMargin,
        unanimousCases,
        mostCommonTopic: formatTopicName(mostCommonTopic),
        topicCount,
        voteDistribution
    };
}

/**
 * Render voting pattern chart using Chart.js
 */
function renderVotingPatternChart(analytics) {
    const canvas = document.getElementById('votingPatternChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const labels = Object.keys(analytics.voteDistribution);
    const data = Object.values(analytics.voteDistribution);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => `${l.split('-')[0]}-${l.split('-')[1]} Split`),
            datasets: [{
                label: 'Number of Cases',
                data: data,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(0, 242, 254, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(240, 147, 251, 1)',
                    'rgba(245, 87, 108, 1)',
                    'rgba(79, 172, 254, 1)',
                    'rgba(0, 242, 254, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Vote Split Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} decision${context.parsed.y !== 1 ? 's' : ''}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Number of Decisions'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Majority-Dissent Split'
                    }
                }
            }
        }
    });
}

/**
 * Filter Supreme Court cases by category
 */
function filterSupremeCourtByCategory(category) {
    const country = CivicState.selectedCountry || 'us';
    const allCases = SAMPLE_COURT_DECISIONS[country] || [];
    
    let filteredCases = category === 'all' ? allCases : allCases.filter(c => c.topic === category);
    
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
            tab.style.background = 'var(--primary)';
            tab.style.color = 'white';
        } else {
            tab.classList.remove('active');
            tab.style.background = 'transparent';
            tab.style.color = 'var(--primary)';
        }
    });
    
    // Re-render cases
    const container = document.getElementById('supremeCourtCasesContainer');
    if (!container) return;
    
    let html = '';
    if (filteredCases.length === 0) {
        html = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <div style="font-size: 3rem; margin-bottom: 15px;">📋</div>
                <h3>No cases found in this category</h3>
            </div>
        `;
    } else {
        filteredCases.forEach(c => {
            html += createCourtDecisionCard(c);
        });
    }
    
    container.innerHTML = html;
}

/**
 * Switch between civic tabs
 * @param {string} tabName - Name of the tab to switch to ('bills', 'representatives', 'court', 'dashboard')
 */
function switchCivicTab(tabName) {
    const DEBUG = true; // V36.9.14: Enabled for debugging civic tab issue
    console.log('🔍 [DEBUG] switchCivicTab called with:', tabName); // Always log for debugging
    
    // Update tab buttons
    const tabs = document.querySelectorAll('.civic-tab');
    tabs.forEach(tab => {
        const tabDataName = tab.getAttribute('data-tab');
        if (tabDataName === tabName) {
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
        } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        }
    });
    
    // Update panels - make sure content is visible
    const panels = document.querySelectorAll('.civic-panel');
    panels.forEach(panel => {
        const panelId = panel.getAttribute('id');
        if (panelId === `${tabName}-panel`) {
            panel.classList.add('active');
            panel.style.display = 'block'; // Force display
            if (DEBUG) console.log('Activated panel:', panelId);
        } else {
            panel.classList.remove('active');
            panel.style.display = 'none'; // Force hide
        }
    });
    
    // Smooth scroll to show active panel content
    setTimeout(() => {
        const activePanel = document.querySelector('.civic-panel.active');
        if (activePanel) {
            // Scroll to position the panel content in view
            const panelTop = activePanel.getBoundingClientRect().top + window.pageYOffset;
            // Offset by 100px to show tabs above
            const scrollTarget = panelTop - 100;
            
            if (DEBUG) console.log('Scrolling to panel content:', scrollTarget);
            
            window.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
            });
        } else if (DEBUG) {
            console.warn('Active panel not found');
        }
    }, 150); // Small delay to ensure panel is rendered
}

// Make function globally available
window.switchCivicTab = switchCivicTab;
console.log('✅ [V36.9.14] civic.js loaded - switchCivicTab is globally available');

// Allow Enter key to search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('civicSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchCivicData();
            }
        });
    }
    
    // Initialize civic chat widget (V32.9.4 - standardized)
    if (typeof initializeCivicChatWidget === 'function') {
        initializeCivicChatWidget();
    }
});
