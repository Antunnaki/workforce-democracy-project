/**
 * LANGUAGE SUPPORT MODULE
 * Multi-language support: English, Spanish, French, German
 */

const TRANSLATIONS = {
    en: {
        // Site header
        site_title: 'Workforce Democracy Project',
        establishment: 'EST 2025',
        
        // Navigation
        nav_civic: '🗳️ Civic Engagement & Transparency',
        nav_jobs: '💼 Explore Jobs',
        nav_learning: '📚 Learn',
        nav_faq: '💡 FAQ',
        nav_local: '📍 Local Resources',
        nav_philosophy: '🌟 Our Philosophies',
        
        // Hero section
        hero_title: 'Discover Democratic Workplaces & Hold Officials Accountable',
        hero_subtitle: 'A warm, welcoming space to explore how work can be different, track your representatives\' voting records, and connect with ethical businesses. Completely non-partisan. Privacy-first. Free forever.',
        hero_welcome: 'Welcome! This is a friendly space to learn about democratic workplaces and track what your elected officials are actually doing.',
        hero_btn_civic: 'Track Representatives',
        hero_btn_jobs: 'Explore Jobs',
        
        // Feature cards
        feature_civic_title: 'Want to see how your representatives vote?',
        feature_civic_desc: 'Track voting records, bills, and decisions from federal to local government.',
        feature_civic_btn: 'View Representatives',
        feature_voting_title: 'Curious how your opinions compare to officials?',
        feature_voting_desc: 'Vote on bills yourself and see which representatives align with your views.',
        feature_voting_btn: 'Track & Compare Votes',
        feature_jobs_title: 'Wondering what your job looks like in a democratic workplace?',
        feature_jobs_desc: 'Explore 230+ professions and see how they transform when workers have real power.',
        feature_jobs_btn: 'Explore Your Job',
        feature_learning_title: 'Want to learn from real examples and research?',
        feature_learning_desc: 'Watch videos, read studies, and see how democratic workplaces succeed worldwide.',
        feature_learning_btn: 'Start Learning',
        feature_faq_title: 'Have questions about how this all works?',
        feature_faq_desc: 'Get answers to common concerns about housing, economy, wages, and transition.',
        feature_faq_btn: 'Read FAQ',
        
        // Civic section
        civic_title: 'Civic Engagement & Transparency',
        civic_headline: 'Track Representatives, Vote on Bills, Make Your Voice Heard',
        civic_subtitle: 'See how your representatives vote on bills, cast your own votes to track alignment, explore Supreme Court decisions, and hold government accountable—all in one place',
        civic_select_country: 'Select Country:',
        civic_choose_country: 'Choose a country...',
        civic_search_placeholder: 'Search representatives or bills...',
        civic_bill_type: 'Bill Type:',
        civic_all_types: 'All Types',
        civic_education: '📚 Education',
        civic_health: '🏥 Health',
        civic_environment: '🌍 Environment',
        civic_economy: '💰 Economy',
        civic_rights: '⚖️ Civil Rights',
        civic_labor: '💼 Labor & Employment',
        civic_housing: '🏠 Housing',
        civic_time_period: 'Time Period:',
        civic_current_session: 'Current Session',
        civic_last_year: 'Last Year',
        civic_full_term: 'Full Term',
        civic_apply_filters: 'Apply Filters',
        civic_placeholder_title: 'Select a country and search to begin',
        civic_placeholder_text: 'Search for representatives by name, district, or explore recent legislation. All data comes directly from official government sources.',
        civic_chat_btn: 'Ask about voting records',
        civic_chat_title: 'Civic Transparency Assistant',
        civic_chat_placeholder: 'Ask about representative voting patterns...',
        
        // Jobs section
        jobs_title: 'Explore Jobs in Democratic Workplaces',
        jobs_subtitle: 'See how your role transforms when workers have real voice and ownership',
        jobs_chat_btn: 'Ask about specific jobs',
        jobs_chat_title: 'Profession Research Assistant',
        jobs_chat_placeholder: 'Ask about any profession...',
        
        // Learning section
        learning_title: 'Learning Resources',
        learning_subtitle: 'Discover through stories, research, and real-world examples',
        learning_all: 'All Resources',
        learning_videos: '🎥 Videos',
        learning_articles: '📄 Articles',
        learning_studies: '📊 Research',
        learning_interactive: '🎮 Interactive',
        
        // Local resources
        local_opt_in_title: 'Personalized Experience (Optional)',
        local_opt_in_text: 'Make your journey more relevant to your location and interests',
        local_privacy_title: 'Your Privacy Protected:',
        local_privacy_1: 'All data stored only on your device',
        local_privacy_2: 'Military-grade encryption',
        local_privacy_3: 'Never shared with anyone',
        local_privacy_4: 'Delete anytime with one click',
        local_enable_btn: 'Enable Personalized Experience',
        local_skip_btn: 'Continue without personalization',
        local_title: 'Local Resources & Ethical Businesses',
        local_subtitle: 'Find ethical businesses and community services near you',
        local_postcode_placeholder: 'Enter your postcode/ZIP',
        local_search_btn: 'Find Resources',
        local_submit_btn: 'Submit a Business',
        
        // Philosophy section
        philosophy_title: 'Our 17 Core Philosophies',
        philosophy_subtitle: 'The principles that guide everything we do',
        
        // Footer
        footer_about: 'About',
        footer_about_text: 'Workforce Democracy Project is a non-partisan educational resource exploring democratic workplaces and government transparency. Completely free, privacy-first, and ad-free forever.',
        footer_privacy: 'Privacy & Security',
        footer_privacy_policy: 'Privacy Policy',
        footer_security: 'Security Information',
        footer_export: 'Export Your Data',
        footer_delete: 'Delete All Data',
        footer_connect: 'Connect',
        footer_connect_text: 'Questions? Suggestions? We\'d love to hear from you.',
        footer_contact: 'Contact Us',
        footer_rights: 'All content freely available under Creative Commons.',
        footer_tracking: 'Zero tracking. Zero ads. Complete privacy.',
        
        // Common
        loading: 'Loading...'
    },
    
    es: {
        // Site header
        site_title: 'Proyecto de Democracia Laboral',
        establishment: 'EST 2025',
        
        // Navigation
        nav_civic: '🗳️ Participación Cívica y Transparencia',
        nav_jobs: '💼 Explorar Trabajos',
        nav_learning: '📚 Aprender',
        nav_faq: '💡 Preguntas Frecuentes',
        nav_local: '📍 Recursos Locales',
        nav_philosophy: '🌟 Nuestras Filosofías',
        
        // Hero section
        hero_title: 'Descubre Lugares de Trabajo Democráticos y Responsabiliza a los Funcionarios',
        hero_subtitle: 'Un espacio cálido y acogedor para explorar cómo puede ser diferente el trabajo, rastrear los registros de votación de tus representantes y conectar con negocios éticos. Completamente no partidista. Privacidad primero. Gratis para siempre.',
        hero_welcome: '¡Bienvenido! Este es un espacio amigable para aprender sobre lugares de trabajo democráticos y rastrear lo que tus funcionarios electos están haciendo realmente.',
        hero_btn_civic: 'Rastrear Representantes',
        hero_btn_jobs: 'Explorar Trabajos',
        
        // Feature cards
        feature_civic_title: '¿Quieres ver cómo votan tus representantes?',
        feature_civic_desc: 'Rastrea registros de votación, proyectos de ley y decisiones desde el gobierno federal hasta el local.',
        feature_civic_btn: 'Ver Representantes',
        feature_voting_title: '¿Curioso cómo se comparan tus opiniones con los funcionarios?',
        feature_voting_desc: 'Vota tú mismo sobre proyectos de ley y ve qué representantes se alinean con tus puntos de vista.',
        feature_voting_btn: 'Rastrear y Comparar Votos',
        feature_jobs_title: '¿Te preguntas cómo se ve tu trabajo en un lugar de trabajo democrático?',
        feature_jobs_desc: 'Explora más de 230 profesiones y ve cómo se transforman cuando los trabajadores tienen poder real.',
        feature_jobs_btn: 'Explorar Tu Trabajo',
        feature_learning_title: '¿Quieres aprender de ejemplos reales e investigación?',
        feature_learning_desc: 'Mira videos, lee estudios y ve cómo los lugares de trabajo democráticos tienen éxito en todo el mundo.',
        feature_learning_btn: 'Comenzar a Aprender',
        feature_faq_title: '¿Tienes preguntas sobre cómo funciona todo esto?',
        feature_faq_desc: 'Obtén respuestas a preocupaciones comunes sobre vivienda, economía, salarios y transición.',
        feature_faq_btn: 'Leer FAQ',
        
        // Civic section
        civic_title: 'Participación Cívica y Transparencia',
        civic_headline: 'Rastrea Representantes, Vota en Proyectos de Ley, Haz Oír Tu Voz',
        civic_subtitle: 'Ve cómo votan tus representantes en proyectos de ley, emite tus propios votos para rastrear la alineación, explora decisiones de la Corte Suprema y responsabiliza al gobierno—todo en un solo lugar',
        civic_select_country: 'Seleccionar País:',
        civic_choose_country: 'Elegir un país...',
        civic_search_placeholder: 'Buscar representantes o proyectos de ley...',
        civic_bill_type: 'Tipo de Ley:',
        civic_all_types: 'Todos los Tipos',
        civic_education: '📚 Educación',
        civic_health: '🏥 Salud',
        civic_environment: '🌍 Medio Ambiente',
        civic_economy: '💰 Economía',
        civic_rights: '⚖️ Derechos Civiles',
        civic_labor: '💼 Trabajo y Empleo',
        civic_housing: '🏠 Vivienda',
        civic_time_period: 'Período de Tiempo:',
        civic_current_session: 'Sesión Actual',
        civic_last_year: 'Último Año',
        civic_full_term: 'Término Completo',
        civic_apply_filters: 'Aplicar Filtros',
        civic_placeholder_title: 'Selecciona un país y busca para comenzar',
        civic_placeholder_text: 'Busca representantes por nombre, distrito o explora legislación reciente. Todos los datos provienen directamente de fuentes gubernamentales oficiales.',
        civic_chat_btn: 'Preguntar sobre registros de votación',
        civic_chat_title: 'Asistente de Transparencia Cívica',
        civic_chat_placeholder: 'Pregunta sobre patrones de votación...',
        
        // Jobs section
        jobs_title: 'Explorar Trabajos en Lugares de Trabajo Democráticos',
        jobs_subtitle: 'Ve cómo se transforma tu rol cuando los trabajadores tienen voz y propiedad real',
        jobs_chat_btn: 'Preguntar sobre trabajos específicos',
        jobs_chat_title: 'Asistente de Investigación Profesional',
        jobs_chat_placeholder: 'Pregunta sobre cualquier profesión...',
        
        // Learning section
        learning_title: 'Recursos de Aprendizaje',
        learning_subtitle: 'Descubre a través de historias, investigación y ejemplos del mundo real',
        learning_all: 'Todos los Recursos',
        learning_videos: '🎥 Videos',
        learning_articles: '📄 Artículos',
        learning_studies: '📊 Investigación',
        learning_interactive: '🎮 Interactivo',
        
        // Local resources
        local_opt_in_title: 'Experiencia Personalizada (Opcional)',
        local_opt_in_text: 'Haz tu viaje más relevante a tu ubicación e intereses',
        local_privacy_title: 'Tu Privacidad Protegida:',
        local_privacy_1: 'Todos los datos almacenados solo en tu dispositivo',
        local_privacy_2: 'Encriptación de grado militar',
        local_privacy_3: 'Nunca compartido con nadie',
        local_privacy_4: 'Eliminar en cualquier momento con un clic',
        local_enable_btn: 'Habilitar Experiencia Personalizada',
        local_skip_btn: 'Continuar sin personalización',
        local_title: 'Recursos Locales y Negocios Éticos',
        local_subtitle: 'Encuentra negocios éticos y servicios comunitarios cerca de ti',
        local_postcode_placeholder: 'Ingresa tu código postal',
        local_search_btn: 'Buscar Recursos',
        local_submit_btn: 'Enviar un Negocio',
        
        // Philosophy section
        philosophy_title: 'Nuestras 17 Filosofías Fundamentales',
        philosophy_subtitle: 'Los principios que guían todo lo que hacemos',
        
        // Footer
        footer_about: 'Acerca de',
        footer_about_text: 'El Proyecto de Democracia Laboral es un recurso educativo no partidista que explora lugares de trabajo democráticos y transparencia gubernamental. Completamente gratis, privacidad primero y sin anuncios para siempre.',
        footer_privacy: 'Privacidad y Seguridad',
        footer_privacy_policy: 'Política de Privacidad',
        footer_security: 'Información de Seguridad',
        footer_export: 'Exportar Tus Datos',
        footer_delete: 'Eliminar Todos los Datos',
        footer_connect: 'Conectar',
        footer_connect_text: '¿Preguntas? ¿Sugerencias? Nos encantaría saber de ti.',
        footer_contact: 'Contáctanos',
        footer_rights: 'Todo el contenido disponible libremente bajo Creative Commons.',
        footer_tracking: 'Cero rastreo. Cero anuncios. Privacidad completa.',
        
        // Common
        loading: 'Cargando...'
    },
    
    fr: {
        // Site header
        site_title: 'Projet de Démocratie du Travail',
        establishment: 'EST 2025',
        
        // Navigation
        nav_civic: '🗳️ Engagement Civique et Transparence',
        nav_jobs: '💼 Explorer les Emplois',
        nav_learning: '📚 Apprendre',
        nav_faq: '💡 FAQ',
        nav_local: '📍 Ressources Locales',
        nav_philosophy: '🌟 Nos Philosophies',
        
        // Hero section
        hero_title: 'Découvrez les Lieux de Travail Démocratiques et Tenez les Élus Responsables',
        hero_subtitle: 'Un espace chaleureux et accueillant pour explorer comment le travail peut être différent, suivre les votes de vos représentants et se connecter avec des entreprises éthiques. Complètement non partisan. Confidentialité d\'abord. Gratuit pour toujours.',
        hero_welcome: 'Bienvenue! C\'est un espace convivial pour apprendre sur les lieux de travail démocratiques et suivre ce que vos élus font réellement.',
        hero_btn_civic: 'Suivre les Représentants',
        hero_btn_jobs: 'Explorer les Emplois',
        
        // Feature cards
        feature_civic_title: 'Voulez-vous voir comment votent vos représentants?',
        feature_civic_desc: 'Suivez les votes, les projets de loi et les décisions du gouvernement fédéral au local.',
        feature_civic_btn: 'Voir les Représentants',
        feature_voting_title: 'Curieux de savoir comment vos opinions se comparent aux élus?',
        feature_voting_desc: 'Votez vous-même sur les projets de loi et voyez quels représentants s\'alignent avec vos opinions.',
        feature_voting_btn: 'Suivre et Comparer les Votes',
        feature_jobs_title: 'Vous vous demandez à quoi ressemble votre travail dans un lieu de travail démocratique?',
        feature_jobs_desc: 'Explorez plus de 230 professions et voyez comment elles se transforment quand les travailleurs ont un vrai pouvoir.',
        feature_jobs_btn: 'Explorer Votre Travail',
        feature_learning_title: 'Voulez-vous apprendre d\'exemples réels et de recherches?',
        feature_learning_desc: 'Regardez des vidéos, lisez des études et voyez comment les lieux de travail démocratiques réussissent dans le monde entier.',
        feature_learning_btn: 'Commencer à Apprendre',
        feature_faq_title: 'Vous avez des questions sur comment tout cela fonctionne?',
        feature_faq_desc: 'Obtenez des réponses aux préoccupations courantes sur le logement, l\'économie, les salaires et la transition.',
        feature_faq_btn: 'Lire la FAQ',
        
        // Civic section
        civic_title: 'Engagement Civique et Transparence',
        civic_headline: 'Suivez les Représentants, Votez sur les Projets de Loi, Faites Entendre Votre Voix',
        civic_subtitle: 'Voyez comment vos représentants votent sur les projets de loi, exprimez vos propres votes pour suivre l\'alignement, explorez les décisions de la Cour suprême et tenez le gouvernement responsable—tout au même endroit',
        
        // Add more French translations...
        loading: 'Chargement...'
    },
    
    de: {
        // Site header
        site_title: 'Arbeitsdemokratie-Projekt',
        establishment: 'EST 2025',
        
        // Navigation
        nav_civic: '🗳️ Bürgerbeteiligung und Transparenz',
        nav_jobs: '💼 Jobs Erkunden',
        nav_learning: '📚 Lernen',
        nav_faq: '💡 FAQ',
        nav_local: '📍 Lokale Ressourcen',
        nav_philosophy: '🌟 Unsere Philosophien',
        
        // Hero section
        hero_title: 'Entdecken Sie Demokratische Arbeitsplätze und Halten Sie Beamte Verantwortlich',
        hero_subtitle: 'Ein warmer, einladender Raum, um zu erkunden, wie Arbeit anders sein kann, die Abstimmungsaufzeichnungen Ihrer Vertreter zu verfolgen und sich mit ethischen Unternehmen zu verbinden. Völlig unparteiisch. Datenschutz zuerst. Für immer kostenlos.',
        hero_welcome: 'Willkommen! Dies ist ein freundlicher Raum, um über demokratische Arbeitsplätze zu lernen und zu verfolgen, was Ihre gewählten Beamten tatsächlich tun.',
        hero_btn_civic: 'Vertreter Verfolgen',
        hero_btn_jobs: 'Jobs Erkunden',
        
        // Feature cards
        feature_civic_title: 'Möchten Sie sehen, wie Ihre Vertreter abstimmen?',
        feature_civic_desc: 'Verfolgen Sie Abstimmungsaufzeichnungen, Gesetze und Entscheidungen von der Bundes- bis zur Kommunalebene.',
        feature_civic_btn: 'Vertreter Ansehen',
        feature_voting_title: 'Neugierig, wie Ihre Meinungen mit Beamten vergleichen?',
        feature_voting_desc: 'Stimmen Sie selbst über Gesetze ab und sehen Sie, welche Vertreter mit Ihren Ansichten übereinstimmen.',
        feature_voting_btn: 'Stimmen Verfolgen und Vergleichen',
        feature_jobs_title: 'Fragen Sie sich, wie Ihr Job an einem demokratischen Arbeitsplatz aussieht?',
        feature_jobs_desc: 'Erkunden Sie über 230 Berufe und sehen Sie, wie sie sich verwandeln, wenn Arbeiter echte Macht haben.',
        feature_jobs_btn: 'Ihren Job Erkunden',
        feature_learning_title: 'Möchten Sie von echten Beispielen und Forschung lernen?',
        feature_learning_desc: 'Sehen Sie sich Videos an, lesen Sie Studien und sehen Sie, wie demokratische Arbeitsplätze weltweit erfolgreich sind.',
        feature_learning_btn: 'Beginnen zu Lernen',
        feature_faq_title: 'Haben Sie Fragen dazu, wie das alles funktioniert?',
        feature_faq_desc: 'Erhalten Sie Antworten auf häufige Bedenken zu Wohnen, Wirtschaft, Löhnen und Übergang.',
        feature_faq_btn: 'FAQ Lesen',
        
        // Privacy badge
        privacy_title: 'Ihr Datenschutz Geschützt',
        privacy_text: 'Null Tracker. Militärische Verschlüsselung. Alle Daten bleiben auf Ihrem Gerät.',
        
        // Civic section
        civic_title: 'Bürgerbeteiligung und Transparenz',
        civic_headline: 'Verfolgen Sie Vertreter, Stimmen Sie über Gesetzentwurfe ab, Lassen Sie Ihre Stimme Hören',
        civic_subtitle: 'Sehen Sie, wie Ihre Vertreter über Gesetzentwurfe abstimmen, geben Sie Ihre eigenen Stimmen ab, um die Ausrichtung zu verfolgen, erkunden Sie Entscheidungen des Obersten Gerichtshofs und machen Sie die Regierung rechenschaftspflichtig—alles an einem Ort',
        
        // Add more German translations...
        loading: 'Laden...'
    }
};

/**
 * Change language
 */
async function changeLanguage(lang) {
    if (!TRANSLATIONS[lang]) {
        console.error('Language not supported:', lang);
        return;
    }
    
    AppState.currentLanguage = lang;
    AppState.preferences.language = lang;
    await saveUserPreferences();
    
    // Update language indicator
    const langBtn = document.getElementById('currentLanguage');
    if (langBtn) {
        langBtn.textContent = lang.toUpperCase();
    }
    
    // Update all translated elements
    applyTranslations(lang);
    
    // Update active state in language menu
    document.querySelectorAll('.language-menu button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Close language menus
    const mobileMenu = document.getElementById('languageMenu');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
    const desktopMenu = document.getElementById('languageMenuDesktop');
    if (desktopMenu) {
        desktopMenu.classList.remove('active');
    }
    
    showNotification(`Language changed to ${getLanguageName(lang)}`, 'success');
}

/**
 * Apply translations to page
 */
function applyTranslations(lang) {
    const translations = TRANSLATIONS[lang];
    
    // Translate elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
    
    // Translate placeholder attributes
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.dataset.translatePlaceholder;
        if (translations[key]) {
            element.placeholder = translations[key];
        }
    });
}

/**
 * Get language full name
 */
function getLanguageName(code) {
    const names = {
        en: 'English',
        es: 'Español',
        fr: 'Français',
        de: 'Deutsch'
    };
    return names[code] || code;
}

// Make function globally available
window.changeLanguage = changeLanguage;
